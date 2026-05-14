import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { MoreThanOrEqual, In } from "typeorm";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { appLogsRepository, AppLogTable } from "../../../database";
import { appLogger } from "../../../util";
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
  const attempts = numberOrUndef(context["attempts"]) ?? 1;
  const reason = stringOrUndef(context["reason"]) ?? action;
  const url = stringOrUndef(context["url"]);
  const existing = blockedIpsByKey.get(ip);
  if (existing) {
    existing.attempts += attempts;
    if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    if (url) existing.lastUrl = url;
    return;
  }
  blockedIpsByKey.set(ip, { ip, attempts, reasons: [reason], lastUrl: url });
}

function stringOrUndef(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberOrUndef(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}
