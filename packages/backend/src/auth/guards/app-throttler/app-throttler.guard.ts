import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
import { Request } from "express";
import { appLogsRepository, AppLogTable } from "../../../database";
import { domifaConfig } from "../../../config";
import {
  RequestBlockReason,
  ThrottleBlockedJwtUser,
  ThrottleBlockedLogContext,
} from "./app-throttler.types";
import {
  extractJwtUser,
  getAllowedOrigins,
  getBlockReason,
  isBypassedRoute,
  sanitizeForLog,
} from "./app-throttler.utils";
import {
  ANONYMOUS_ACTOR_FIELDS,
  SYSTEM_ACTOR_FIELDS,
} from "../../../modules/app-logs/app-logs.helpers";
import { userStatusManager } from "../../../modules/users/services";

const SKIP_THROTTLE_ENVS = ["test"];
const REQUEST_BLOCK_DEDUP_TTL_MS = 5 * 60 * 1000;

const AUTO_BLOCK_REASONS: ReadonlySet<RequestBlockReason> = new Set([
  "bot_ua",
  "missing_ua",
]);
const AUTO_BLOCK_PROFILES: ReadonlySet<string> = new Set([
  "structure",
  "supervisor",
]);

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger("AppThrottlerGuard");
  private readonly activeBlocks = new Map<string, string>();
  private readonly allowedOrigins = getAllowedOrigins();
  private readonly internalUserAgent =
    domifaConfig().security.internalUserAgent;

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Bypass machine-to-machine probes (k8s liveness/readiness) and the
    // cached public stats endpoint (no auth, no PII).
    if (isBypassedRoute(request.url)) {
      return true;
    }

    // Bypass internal probes (e.g. fabnum blackbox monitoring). Skips the
    // whole throttler — bot filter AND rate limits — so polling is silent.
    if (this.isInternalProbe(request.headers["user-agent"])) {
      return true;
    }

    // Bot/scraper filtering runs in every env (including test) so the
    // behavior is verifiable through the same supertest pipeline.
    const blockReason = getBlockReason(request, this.allowedOrigins);
    if (blockReason !== null) {
      await this.logRequestBlock(request, blockReason);
      throw new ForbiddenException("FORBIDDEN");
    }

    const envId = domifaConfig().envId;
    if (SKIP_THROTTLE_ENVS.includes(envId)) {
      this.logger.debug(
        `[THROTTLE] Skipped: envId="${envId}" not in THROTTLED_ENVS`
      );
      return true;
    }

    this.logger.debug(
      `[THROTTLE] envId="${envId}" ip="${request.ip}" x-forwarded-for="${request.headers["x-forwarded-for"]}" x-real-ip="${request.headers["x-real-ip"]}" ${request.method} ${request.url}`
    );

    return super.canActivate(context);
  }

  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();

    const logContext: ThrottleBlockedLogContext = {
      ...throttlerLimitDetail,
      ip: sanitizeForLog(request.ip),
      userAgent: sanitizeForLog(request.headers["user-agent"]),
      method: sanitizeForLog(request.method) ?? "",
      url: sanitizeForLog(request.url) ?? "",
      jwtUser: extractJwtUser(request.headers["authorization"]),
    };

    const existingLogUuid = this.activeBlocks.get(throttlerLimitDetail.key);

    if (existingLogUuid) {
      await appLogsRepository
        .update(existingLogUuid, { context: logContext as any })
        .catch(() => undefined);
    } else {
      const log = new AppLogTable({
        ...ANONYMOUS_ACTOR_FIELDS,
        action: "THROTTLE_BLOCKED",
        context: logContext,
      });

      const saved = await appLogsRepository.save(log).catch(() => undefined);

      if (saved?.uuid) {
        this.activeBlocks.set(throttlerLimitDetail.key, saved.uuid);

        const timeout = setTimeout(() => {
          this.activeBlocks.delete(throttlerLimitDetail.key);
        }, throttlerLimitDetail.ttl);
        timeout.unref();
      }
    }

    return super.throwThrottlingException(context, throttlerLimitDetail);
  }

  private isInternalProbe(userAgent: string | string[] | undefined): boolean {
    if (!this.internalUserAgent) {
      return false;
    }
    if (typeof userAgent !== "string") {
      return false;
    }
    return userAgent === this.internalUserAgent;
  }

  private async logRequestBlock(
    request: Request,
    reason: RequestBlockReason
  ): Promise<void> {
    const jwtUser = extractJwtUser(request.headers["authorization"]);

    // Per-user dedup when authenticated so the attempts counter accumulates
    // for that account regardless of source IP. Anonymous traffic still
    // dedup'd per IP.
    const dedupKey = jwtUser?.userId
      ? `request-block:${reason}:user:${jwtUser.userProfile}:${jwtUser.userId}`
      : `request-block:${reason}:ip:${request.ip ?? "unknown"}`;

    const baseContext: ThrottleBlockedLogContext = {
      ip: sanitizeForLog(request.ip),
      userAgent: sanitizeForLog(request.headers["user-agent"]),
      method: sanitizeForLog(request.method) ?? "",
      url: sanitizeForLog(request.url) ?? "",
      jwtUser,
      reason,
      origin: sanitizeForLog(request.headers["origin"]),
      referer: sanitizeForLog(request.headers["referer"]),
    };

    const existingLogUuid = this.activeBlocks.get(dedupKey);

    if (existingLogUuid) {
      // Atomic increment of the attempts counter alongside the context refresh.
      // context is stored as json (not jsonb), so cast both ways.
      await appLogsRepository
        .query(
          `UPDATE app_log
           SET context = jsonb_set(
             $2::jsonb,
             '{attempts}',
             to_jsonb(COALESCE((context->>'attempts')::int, 1) + 1)
           )::json
           WHERE uuid = $1`,
          [existingLogUuid, JSON.stringify(baseContext)]
        )
        .catch(() => undefined);
    } else {
      const log = new AppLogTable({
        ...ANONYMOUS_ACTOR_FIELDS,
        action: "REQUEST_BLOCKED",
        context: { ...baseContext, attempts: 1 },
      });

      const saved = await appLogsRepository.save(log).catch(() => undefined);

      if (saved?.uuid) {
        this.activeBlocks.set(dedupKey, saved.uuid);

        const timeout = setTimeout(() => {
          this.activeBlocks.delete(dedupKey);
        }, REQUEST_BLOCK_DEDUP_TTL_MS);
        timeout.unref();
      }
    }

    await this.maybeAutoBlockUser(reason, jwtUser);
  }

  private async maybeAutoBlockUser(
    reason: RequestBlockReason,
    jwtUser: ThrottleBlockedJwtUser | undefined
  ): Promise<void> {
    if (!jwtUser?.userId) {
      return;
    }
    if (!AUTO_BLOCK_REASONS.has(reason)) {
      return;
    }
    if (!AUTO_BLOCK_PROFILES.has(jwtUser.userProfile)) {
      return;
    }

    const userProfile = jwtUser.userProfile as "structure" | "supervisor";

    // Avoid duplicate BLOCK_USER logs once the account is already locked.
    const currentStatus = await userStatusManager
      .getUserStatusFromDb({ userProfile, userId: jwtUser.userId })
      .catch(() => null);
    if (currentStatus === "BLOCKED") {
      return;
    }

    await userStatusManager
      .markUserAsBlocked({ userProfile, userId: jwtUser.userId })
      .catch(() => undefined);

    await appLogsRepository
      .save(
        new AppLogTable({
          ...SYSTEM_ACTOR_FIELDS,
          action: "BLOCK_USER",
          context: {
            autoBlocked: true,
            triggeredBy: "AppThrottlerGuard",
            reason,
            blockedUser: {
              userId: jwtUser.userId,
              userProfile,
              structureId: jwtUser.structureId,
              email: jwtUser.email,
              role: jwtUser.role,
            },
          },
        })
      )
      .catch(() => undefined);

    this.logger.warn(
      `[AUTO_BLOCK] ${userProfile} user ${jwtUser.userId} blocked (reason=${reason})`
    );
  }
}
