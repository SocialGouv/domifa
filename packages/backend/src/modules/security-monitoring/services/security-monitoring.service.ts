import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { MoreThanOrEqual, In } from "typeorm";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import {
  appLogSecurityRepository,
  AppLogSecurityTable,
  structureRepository,
  userStructureRepository,
  userSupervisorRepository,
} from "../../../database";
import { appLogger } from "../../../util";
import { formatThrottleWindow } from "../../../auth/guards/app-throttler/app-throttler.utils";
import {
  BlockedIpSummary,
  BlockedUserSummary,
  EmailAlertingLogAction,
  PermanentlyBlockedAccount,
  SuspiciousActivitySummary,
} from "../types/security-alert.types";
import { EMAIL_ALERTING_LOG_ACTIONS } from "../constants/SECURITY_LOG_ACTIONS.const";
import { SecurityAlertEmailService } from "./security-alert-email.service";

const WINDOW_MS = 5 * 60 * 1000;
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

    const rawLogs = await appLogSecurityRepository.find({
      where: {
        action: In(EMAIL_ALERTING_LOG_ACTIONS),
        createdAt: MoreThanOrEqual(windowStart),
      },
      order: { createdAt: "DESC" },
    });

    // FAILED_AUTH_THRESHOLD = a user typed bad credentials / clicked a stale
    // magic link 3x in an hour. Triggered routinely by legit users mistyping
    // or by email scanners (Outlook SafeLinks, AV prefetch) hitting reset /
    // activation URLs — it's operational noise, not an attack. Drop it from
    // the alert pipeline (the row stays in app_log_security for audit).
    const recentLogs = rawLogs.filter(
      (log) =>
        !(
          log.action === "BLOCK_USER" &&
          (log.context as Record<string, unknown> | null)?.["reason"] ===
            "FAILED_AUTH_THRESHOLD"
        )
    );

    if (recentLogs.length === 0) {
      appLogger.debug(
        "[CRON] [securityMonitoring] No suspicious activity in the last 5 minutes"
      );
      return;
    }

    const summary = buildSummary({ recentLogs, windowStart, windowEnd });
    await enrichBlockedUsersWithStructure(summary.blockedUsers);
    summary.permanentlyBlockedAccounts = await loadPermanentlyBlockedAccounts();

    const blockedEmails = summary.permanentlyBlockedAccounts
      .map((account) => account.email)
      .filter((email): email is string => !!email);
    appLogger.warn(
      `[CRON] [securityMonitoring] Detected ${
        recentLogs.length
      } suspicious event(s) (blocked users: ${
        summary.blockedUsers.length
      }, blocked IPs: ${
        summary.blockedIps.length
      }, permanently blocked accounts: ${
        summary.permanentlyBlockedAccounts.length
      }${blockedEmails.length > 0 ? ` [${blockedEmails.join(", ")}]` : ""})`
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

// Internal aggregator: keeps REQUEST_BLOCKED and THROTTLE_BLOCKED contributions
// separate so the final attempts count doesn't double-count.
// - requestBlockedAttempts: sum of the already-deduped attempts counter on
//   REQUEST_BLOCKED rows (one row per (reason, IP/user) dedup key).
// - maxThrottleHits: max totalHits across THROTTLE_BLOCKED rows. The throttler
//   writes one row per tier (short/medium/long), and each tier increments its
//   counter on the SAME physical request — so summing across tiers triples the
//   real number. We keep the max as the best lower bound on real traffic.
// - bestThrottle: the tier with the smallest TTL among those that fired (i.e.
//   the burst-protection tier). More informative than the long-window tier,
//   whose totalHits keeps climbing during the 2h block.
type IpAggregator = {
  ip: string;
  reasons: string[];
  lastUrl?: string;
  requestBlockedAttempts: number;
  maxThrottleHits: number;
  bestThrottle?: { ttl: number; limit: number; totalHits: number };
  attemptedIdentifiers?: string[];
  attemptedIdentifiersOverflow?: number;
};

function buildSummary({
  recentLogs,
  windowStart,
  windowEnd,
}: {
  recentLogs: AppLogSecurityTable[];
  windowStart: Date;
  windowEnd: Date;
}): SuspiciousActivitySummary {
  const totals: Record<EmailAlertingLogAction, number> = {
    BLOCK_USER: 0,
    REQUEST_BLOCKED: 0,
    THROTTLE_BLOCKED: 0,
  };

  const blockedUsersById = new Map<number, BlockedUserSummary>();
  const ipAggregators = new Map<string, IpAggregator>();

  for (const log of recentLogs) {
    const action = log.action as EmailAlertingLogAction;
    if (action in totals) {
      totals[action] += 1;
    }

    const context = (log.context ?? {}) as Record<string, unknown>;
    if (action === "BLOCK_USER") {
      ingestBlockUserLog({ log, context, blockedUsersById });
    } else {
      ingestBlockedIpLog({ action, context, ipAggregators });
    }
  }

  const blockedUsers = [...blockedUsersById.values()].slice(
    0,
    MAX_USERS_IN_REPORT
  );
  const blockedIps = [...ipAggregators.values()]
    .map(toBlockedIpSummary)
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, MAX_IPS_IN_REPORT);

  return {
    windowStart,
    windowEnd,
    totals,
    blockedUsers,
    blockedIps,
    permanentlyBlockedAccounts: [],
  };
}

function toBlockedIpSummary(agg: IpAggregator): BlockedIpSummary {
  return {
    ip: agg.ip,
    attempts: agg.requestBlockedAttempts + agg.maxThrottleHits,
    reasons: agg.reasons,
    lastUrl: agg.lastUrl,
    throttle: agg.bestThrottle
      ? {
          windowLabel: formatThrottleWindow(agg.bestThrottle.ttl),
          limit: agg.bestThrottle.limit,
          totalHits: agg.bestThrottle.totalHits,
        }
      : undefined,
    attemptedIdentifiers: agg.attemptedIdentifiers,
    attemptedIdentifiersOverflow: agg.attemptedIdentifiersOverflow,
  };
}

function ingestBlockUserLog({
  log,
  context,
  blockedUsersById,
}: {
  log: AppLogSecurityTable;
  context: Record<string, unknown>;
  blockedUsersById: Map<number, BlockedUserSummary>;
}): void {
  const userId = Number(
    context["userId"] ?? log.userStructureId ?? log.userSupervisorId
  );
  if (!Number.isFinite(userId) || userId <= 0) return;
  if (blockedUsersById.has(userId)) return;

  const throttleCtx =
    (context["throttle"] as Record<string, unknown>) ?? undefined;
  const throttleLimit = throttleCtx
    ? numberOrUndef(throttleCtx["limit"])
    : undefined;
  const throttleTtl = throttleCtx
    ? numberOrUndef(throttleCtx["ttl"])
    : undefined;

  blockedUsersById.set(userId, {
    userId,
    userProfile: stringOrUndef(context["userProfile"]),
    structureId: numberOrUndef(context["structureId"]) ?? log.structureId,
    email: stringOrUndef(context["email"]),
    role: stringOrUndef(context["role"]),
    reason: stringOrUndef(context["reason"]),
    triggerIp: throttleCtx ? stringOrUndef(throttleCtx["ip"]) : undefined,
    triggerUrl: throttleCtx ? stringOrUndef(throttleCtx["url"]) : undefined,
    triggerMethod: throttleCtx
      ? stringOrUndef(throttleCtx["method"])
      : undefined,
    attemptedIdentifier: stringOrUndef(context["attemptedIdentifier"]),
    targetRoute: stringOrUndef(context["targetRoute"]),
    throttle:
      throttleLimit !== undefined && throttleTtl !== undefined
        ? {
            windowLabel: formatThrottleWindow(throttleTtl),
            limit: throttleLimit,
          }
        : undefined,
  });
}

function ingestBlockedIpLog({
  action,
  context,
  ipAggregators,
}: {
  action: EmailAlertingLogAction;
  context: Record<string, unknown>;
  ipAggregators: Map<string, IpAggregator>;
}): void {
  const ip = stringOrUndef(context["ip"]);
  if (!ip) {
    return;
  }

  let agg = ipAggregators.get(ip);
  if (!agg) {
    agg = {
      ip,
      reasons: [],
      requestBlockedAttempts: 0,
      maxThrottleHits: 0,
    };
    ipAggregators.set(ip, agg);
  }

  const reason = stringOrUndef(context["reason"]) ?? action;
  if (!agg.reasons.includes(reason)) {
    agg.reasons.push(reason);
  }

  const url = stringOrUndef(context["url"]);
  if (url) {
    agg.lastUrl = url;
  }

  const attemptedIdentifier = stringOrUndef(context["attemptedIdentifier"]);
  if (attemptedIdentifier) {
    appendIdentifier(agg, attemptedIdentifier);
  }

  if (action === "THROTTLE_BLOCKED") {
    const totalHits = numberOrUndef(context["totalHits"]);
    const limit = numberOrUndef(context["limit"]);
    const ttl = numberOrUndef(context["ttl"]);

    if (totalHits !== undefined && totalHits > agg.maxThrottleHits) {
      agg.maxThrottleHits = totalHits;
    }
    if (
      limit !== undefined &&
      totalHits !== undefined &&
      ttl !== undefined &&
      (!agg.bestThrottle || ttl < agg.bestThrottle.ttl)
    ) {
      agg.bestThrottle = { ttl, limit, totalHits };
    }
  } else {
    // REQUEST_BLOCKED rows are deduped per (reason, IP/user) by the guard, so
    // summing the per-row attempts counter is the right total.
    const attempts = numberOrUndef(context["attempts"]) ?? 1;
    agg.requestBlockedAttempts += attempts;
  }
}

function appendIdentifier(
  entry: {
    attemptedIdentifiers?: string[];
    attemptedIdentifiersOverflow?: number;
  },
  identifier: string
): void {
  if (!entry.attemptedIdentifiers) {
    entry.attemptedIdentifiers = [];
  }
  if (entry.attemptedIdentifiers.includes(identifier)) {
    return;
  }
  if (entry.attemptedIdentifiers.length >= MAX_IDENTIFIERS_PER_IP) {
    entry.attemptedIdentifiersOverflow =
      (entry.attemptedIdentifiersOverflow ?? 0) + 1;
    return;
  }
  entry.attemptedIdentifiers.push(identifier);
}

// Snapshot of every account currently in status='BLOCKED' across structure and
// supervisor tables. Surfaced in the alert email so operators can see the
// cumulative blocked state (not only what fired in the 5-min window).
async function loadPermanentlyBlockedAccounts(): Promise<
  PermanentlyBlockedAccount[]
> {
  try {
    const [structureRows, supervisorRows] = await Promise.all([
      userStructureRepository.find({
        where: { status: "BLOCKED" },
        select: {
          id: true,
          email: true,
          role: true,
          structureId: true,
        },
      }),
      userSupervisorRepository.find({
        where: { status: "BLOCKED" },
        select: { id: true, email: true, role: true },
      }),
    ]);

    const accounts: PermanentlyBlockedAccount[] = [
      ...structureRows.map((row) => ({
        userId: row.id,
        userProfile: "structure" as const,
        email: row.email,
        role: row.role,
        structureId: row.structureId,
      })),
      ...supervisorRows.map((row) => ({
        userId: row.id,
        userProfile: "supervisor" as const,
        email: row.email,
        role: row.role,
      })),
    ];

    const structureIds = [
      ...new Set(
        accounts
          .map((a) => a.structureId)
          .filter((id): id is number => typeof id === "number")
      ),
    ];
    if (structureIds.length > 0) {
      const rows = await structureRepository.find({
        where: { id: In(structureIds) },
        select: { id: true, nom: true, ville: true },
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      for (const account of accounts) {
        if (account.structureId === undefined) continue;
        const row = byId.get(account.structureId);
        if (!row) continue;
        account.structureName = row.nom;
        account.structureCity = row.ville;
      }
    }

    return accounts;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appLogger.warn(
      `[CRON] [securityMonitoring] Failed to load permanently blocked accounts: ${message}`
    );
    return [];
  }
}

async function enrichBlockedUsersWithStructure(
  blockedUsers: BlockedUserSummary[]
): Promise<void> {
  const structureIds = [
    ...new Set(
      blockedUsers
        .map((u) => u.structureId)
        .filter((id): id is number => typeof id === "number")
    ),
  ];
  if (structureIds.length === 0) {
    return;
  }
  try {
    const rows = await structureRepository.find({
      where: { id: In(structureIds) },
      select: { id: true, nom: true, ville: true },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const user of blockedUsers) {
      if (user.structureId === undefined) {
        continue;
      }
      const row = byId.get(user.structureId);
      if (!row) {
        continue;
      }
      user.structureName = row.nom;
      user.structureCity = row.ville;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appLogger.warn(
      `[CRON] [securityMonitoring] Failed to enrich blocked users with structure info: ${message}`
    );
  }
}

function stringOrUndef(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberOrUndef(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}
