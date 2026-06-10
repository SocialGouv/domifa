import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { MoreThanOrEqual, In } from "typeorm";

import { domifaConfig } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import {
  appLogsRepository,
  appLogSecurityRepository,
  AppLogSecurityTable,
  structureRepository,
} from "../../../database";
import { appLogger } from "../../../util";
import { formatThrottleWindow } from "../../../auth/guards/app-throttler/app-throttler.utils";
import {
  BlockedIpSummary,
  BlockedUserSummary,
  EmailAlertingLogAction,
  QuotaExceededEntry,
  QuotaKind,
  SuspiciousActivitySummary,
} from "../types/security-alert.types";
import { EMAIL_ALERTING_LOG_ACTIONS } from "../constants/SECURITY_LOG_ACTIONS.const";
import { SecurityAlertEmailService } from "./security-alert-email.service";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_USERS_IN_REPORT = 20;
const MAX_IPS_IN_REPORT = 20;
const MAX_IDENTIFIERS_PER_IP = 10;

const PARIS_TZ = "Europe/Paris";
// app_log.action values matching each QuotaKind. Kept colocated so the count
// query and the dedup key stay aligned with the existing controller log calls
// (usager-docs.controller.ts, usagers.controller.ts).
const QUOTA_ACTION_BY_KIND: Record<QuotaKind, string> = {
  USAGERS_DOCS_DOWNLOAD: "USAGERS_DOCS_DOWNLOAD",
  USAGERS_DOCS_UPLOAD: "USAGERS_DOCS_UPLOAD",
  USAGERS_DELETE: "USAGERS_DELETE",
};

@Injectable()
export class SecurityMonitoringService {
  // In-memory dedup of quota alerts already fired today. Safe because
  // backend-cron runs as a single long-lived pod (k8s Deployment, 1 replica).
  // A pod restart loses the set and may re-fire alerts for structures already
  // over quota — acceptable on phase 1 (observation only). Reset on Paris day
  // rollover so old keys don't accumulate.
  private quotaAlertedDayKey = "";
  private readonly quotaAlertedToday = new Set<string>();

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

    // The alert email only carries genuinely new, actionable events:
    //   * definitive BLOCK_USER on bot/UA / throttle violations (autoBlocked)
    //   * REQUEST_BLOCKED (bot detection, missing UA, bad origin, …)
    //   * THROTTLE_BLOCKED (spam / brute force)
    // Temporary lockouts driven by harmless operational noise are filtered
    // out — they fire many times a day on prod and would drown the signal:
    //   * FAILED_AUTH_THRESHOLD : 3 bad credentials in an hour. Legit users
    //     mistyping, plus email scanners (SafeLinks, AV prefetch) hitting
    //     stale reset / activation URLs.
    //   * OTP_REQUEST_LIMIT : 10 OTP requests in an hour. Legit users hitting
    //     "Renvoyer le code".
    // Both rows stay in app_log_security for audit — only the alert pipeline
    // is silenced.
    const NOISY_TEMP_BLOCK_REASONS = new Set([
      "FAILED_AUTH_THRESHOLD",
      "OTP_REQUEST_LIMIT",
    ]);
    const recentLogs = rawLogs.filter((log) => {
      if (log.action !== "BLOCK_USER") return true;
      const reason = (log.context as Record<string, unknown> | null)?.[
        "reason"
      ];
      return (
        typeof reason !== "string" || !NOISY_TEMP_BLOCK_REASONS.has(reason)
      );
    });

    const quotaExceedances = await this.scanBehavioralQuotas();

    if (recentLogs.length === 0 && quotaExceedances.length === 0) {
      appLogger.debug(
        "[CRON] [securityMonitoring] No suspicious activity in the last 5 minutes"
      );
      return;
    }

    const summary = buildSummary({
      recentLogs,
      windowStart,
      windowEnd,
      quotaExceedances,
    });
    await enrichBlockedUsersWithStructure(summary.blockedUsers);

    appLogger.warn(
      `[CRON] [securityMonitoring] Detected ${recentLogs.length} suspicious event(s) (blocked users: ${summary.blockedUsers.length}, blocked IPs: ${summary.blockedIps.length}, quota exceedances: ${quotaExceedances.length})`
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

  // Detects structures that crossed a daily behavioural quota (download /
  // upload / delete) since the last cron tick. The dedup set is reset whenever
  // the Paris calendar day rolls over so each (structure, kind) yields a
  // single alert per day.
  private async scanBehavioralQuotas(): Promise<QuotaExceededEntry[]> {
    const { quotas } = domifaConfig();
    const thresholds: Record<QuotaKind, number> = {
      USAGERS_DOCS_DOWNLOAD: quotas.usagersDocsDownloadPerDay,
      USAGERS_DOCS_UPLOAD: quotas.usagersDocsUploadPerDay,
      USAGERS_DELETE: quotas.usagersDeletePerDay,
    };

    const now = new Date();
    const parisNow = utcToZonedTime(now, PARIS_TZ);
    const dayKey = format(parisNow, "yyyy-MM-dd");
    if (dayKey !== this.quotaAlertedDayKey) {
      this.quotaAlertedDayKey = dayKey;
      this.quotaAlertedToday.clear();
    }
    const startOfDayUtc = zonedTimeToUtc(`${dayKey}T00:00:00`, PARIS_TZ);

    // Single SQL: counts per (structureId, action) over today's actions, kept
    // only when the structure crossed at least one quota. The HAVING relies on
    // the smallest threshold to keep the result set tight; the per-kind check
    // below filters out rows that crossed a different (lower) threshold but
    // not the one currently being processed.
    const minThreshold = Math.min(...Object.values(thresholds));
    const rows = await appLogsRepository
      .createQueryBuilder("log")
      .select("log.structureId", "structureId")
      .addSelect("log.action", "action")
      .addSelect("COUNT(*)", "count")
      .where("log.action IN (:...actions)", {
        actions: Object.values(QUOTA_ACTION_BY_KIND),
      })
      .andWhere("log.createdAt >= :start", { start: startOfDayUtc })
      .andWhere("log.structureId IS NOT NULL")
      .groupBy("log.structureId")
      .addGroupBy("log.action")
      .having("COUNT(*) > :min", { min: minThreshold })
      .getRawMany<{ structureId: number; action: string; count: string }>();

    const newEntries: QuotaExceededEntry[] = [];
    for (const row of rows) {
      const kind = (Object.keys(QUOTA_ACTION_BY_KIND) as QuotaKind[]).find(
        (k) => QUOTA_ACTION_BY_KIND[k] === row.action
      );
      if (!kind) continue;
      const count = Number(row.count);
      const threshold = thresholds[kind];
      if (!Number.isFinite(count) || count <= threshold) continue;

      const dedupKey = `${row.structureId}:${kind}`;
      if (this.quotaAlertedToday.has(dedupKey)) continue;
      this.quotaAlertedToday.add(dedupKey);

      newEntries.push({
        kind,
        structureId: Number(row.structureId),
        count,
        threshold,
      });
    }

    await enrichQuotaEntriesWithStructure(newEntries);
    return newEntries;
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
  quotaExceedances,
}: {
  recentLogs: AppLogSecurityTable[];
  windowStart: Date;
  windowEnd: Date;
  quotaExceedances: QuotaExceededEntry[];
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
    quotaExceedances,
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

async function enrichQuotaEntriesWithStructure(
  entries: QuotaExceededEntry[]
): Promise<void> {
  const structureIds = [...new Set(entries.map((e) => e.structureId))];
  if (structureIds.length === 0) return;
  try {
    const rows = await structureRepository.find({
      where: { id: In(structureIds) },
      select: { id: true, nom: true, ville: true },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const entry of entries) {
      const row = byId.get(entry.structureId);
      if (!row) continue;
      entry.structureName = row.nom;
      entry.structureCity = row.ville;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appLogger.warn(
      `[CRON] [securityMonitoring] Failed to enrich quota entries with structure info: ${message}`
    );
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
