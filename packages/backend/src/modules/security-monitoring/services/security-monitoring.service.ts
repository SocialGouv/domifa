import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { MoreThanOrEqual, In } from "typeorm";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { appLogsRepository, AppLogTable } from "../../../database";
import { appLogger } from "../../../util";
import { formatThrottleWindow } from "../../../auth/guards/app-throttler/app-throttler.utils";
import {
  BlockedIpSummary,
  BlockedUserSummary,
  SecurityLogAction,
  SuspiciousActivitySummary,
} from "../types/security-alert.types";
import { SecurityAlertEmailService } from "./security-alert-email.service";

const WINDOW_MS = 5 * 60 * 1000;
const SECURITY_ACTIONS: SecurityLogAction[] = [
  "BLOCK_USER",
  "REQUEST_BLOCKED",
  "THROTTLE_BLOCKED",
];
const MAX_USERS_IN_REPORT = 20;
const MAX_IPS_IN_REPORT = 20;
const MAX_IDENTIFIERS_PER_IP = 10;

@Injectable()
export class SecurityMonitoringService {
  public constructor(
    private readonly alertEmailService: SecurityAlertEmailService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { timeZone: "Europe/Paris" })
  @SentryCron("security-monitoring-scan", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_5_MINUTES,
    },
    timezone: "Europe/Paris",
    checkinMargin: 2,
    maxRuntime: 5,
  })
  public async scanSuspiciousActivityCron(): Promise<void> {
    if (!isCronEnabled()) {
      appLogger.debug("[CRON] [securityMonitoring] Disabled by config");
      return;
    }

    const windowEnd = new Date();
    const windowStart = new Date(windowEnd.getTime() - WINDOW_MS);

    const recentLogs = await appLogsRepository.find({
      where: {
        action: In(SECURITY_ACTIONS),
        createdAt: MoreThanOrEqual(windowStart),
      },
      order: { createdAt: "DESC" },
    });

    if (recentLogs.length === 0) {
      appLogger.debug(
        "[CRON] [securityMonitoring] No suspicious activity in the last 5 minutes"
      );
      return;
    }

    const summary = buildSummary({ recentLogs, windowStart, windowEnd });

    appLogger.warn(
      `[CRON] [securityMonitoring] Detected ${recentLogs.length} suspicious event(s) (blocked users: ${summary.blockedUsers.length}, blocked IPs: ${summary.blockedIps.length})`
    );

    try {
      const result = await this.alertEmailService.sendSuspiciousActivityAlert(
        summary
      );
      if (result.sent === false) {
        appLogger.info(
          `[CRON] [securityMonitoring] Alert not sent (reason=${result.reason})`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      appLogger.error(
        `[CRON] [securityMonitoring] Failed to send security alert: ${message}`
      );
    }
  }
}

function buildSummary({
  recentLogs,
  windowStart,
  windowEnd,
}: {
  recentLogs: AppLogTable[];
  windowStart: Date;
  windowEnd: Date;
}): SuspiciousActivitySummary {
  const totals: Record<SecurityLogAction, number> = {
    BLOCK_USER: 0,
    REQUEST_BLOCKED: 0,
    THROTTLE_BLOCKED: 0,
  };

  const blockedUsersById = new Map<number, BlockedUserSummary>();
  const blockedIpsByKey = new Map<string, BlockedIpSummary>();

  for (const log of recentLogs) {
    const action = log.action as SecurityLogAction;
    if (action in totals) totals[action] += 1;

    const context = (log.context ?? {}) as Record<string, unknown>;
    if (action === "BLOCK_USER") {
      ingestBlockUserLog({ log, context, blockedUsersById });
    } else {
      ingestBlockedIpLog({ action, context, blockedIpsByKey });
    }
  }

  const blockedUsers = [...blockedUsersById.values()].slice(
    0,
    MAX_USERS_IN_REPORT
  );
  const blockedIps = [...blockedIpsByKey.values()]
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, MAX_IPS_IN_REPORT);

  return { windowStart, windowEnd, totals, blockedUsers, blockedIps };
}

function ingestBlockUserLog({
  log,
  context,
  blockedUsersById,
}: {
  log: AppLogTable;
  context: Record<string, unknown>;
  blockedUsersById: Map<number, BlockedUserSummary>;
}): void {
  const blockedUser = (context["blockedUser"] as Record<string, unknown>) ?? {};
  const userId = Number(blockedUser["userId"] ?? log.userId);
  if (!Number.isFinite(userId) || userId <= 0) return;
  if (blockedUsersById.has(userId)) return;
  blockedUsersById.set(userId, {
    userId,
    userProfile: stringOrUndef(blockedUser["userProfile"]),
    structureId: numberOrUndef(blockedUser["structureId"]),
    email: stringOrUndef(blockedUser["email"]),
    role: stringOrUndef(blockedUser["role"]),
    reason: stringOrUndef(context["reason"]),
  });
}

function ingestBlockedIpLog({
  action,
  context,
  blockedIpsByKey,
}: {
  action: SecurityLogAction;
  context: Record<string, unknown>;
  blockedIpsByKey: Map<string, BlockedIpSummary>;
}): void {
  const ip = stringOrUndef(context["ip"]);
  if (!ip) return;
  // THROTTLE rows expose totalHits (raw rate-limiter counter), REQUEST rows expose attempts (dedup'd counter).
  const attempts =
    action === "THROTTLE_BLOCKED"
      ? numberOrUndef(context["totalHits"]) ?? 1
      : numberOrUndef(context["attempts"]) ?? 1;
  const reason = stringOrUndef(context["reason"]) ?? action;
  const url = stringOrUndef(context["url"]);
  const throttle = extractThrottleDetails(action, context);
  const attemptedIdentifier = stringOrUndef(context["attemptedIdentifier"]);

  const existing = blockedIpsByKey.get(ip);
  if (existing) {
    existing.attempts += attempts;
    if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    if (url) existing.lastUrl = url;
    if (
      throttle &&
      (!existing.throttle || throttle.totalHits > existing.throttle.totalHits)
    ) {
      existing.throttle = throttle;
    }
    if (attemptedIdentifier) {
      appendIdentifier(existing, attemptedIdentifier);
    }
    return;
  }
  const entry: BlockedIpSummary = {
    ip,
    attempts,
    reasons: [reason],
    lastUrl: url,
    throttle,
  };
  if (attemptedIdentifier) {
    appendIdentifier(entry, attemptedIdentifier);
  }
  blockedIpsByKey.set(ip, entry);
}

function appendIdentifier(entry: BlockedIpSummary, identifier: string): void {
  if (!entry.attemptedIdentifiers) entry.attemptedIdentifiers = [];
  if (entry.attemptedIdentifiers.includes(identifier)) return;
  if (entry.attemptedIdentifiers.length >= MAX_IDENTIFIERS_PER_IP) {
    entry.attemptedIdentifiersOverflow =
      (entry.attemptedIdentifiersOverflow ?? 0) + 1;
    return;
  }
  entry.attemptedIdentifiers.push(identifier);
}

function extractThrottleDetails(
  action: SecurityLogAction,
  context: Record<string, unknown>
): BlockedIpSummary["throttle"] | undefined {
  if (action !== "THROTTLE_BLOCKED") return undefined;
  const ttl = numberOrUndef(context["ttl"]);
  const limit = numberOrUndef(context["limit"]);
  const totalHits = numberOrUndef(context["totalHits"]);
  if (limit === undefined || totalHits === undefined) return undefined;
  return { windowLabel: formatThrottleWindow(ttl), limit, totalHits };
}

function stringOrUndef(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberOrUndef(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}
