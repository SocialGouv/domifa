import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
import { createHash } from "node:crypto";
import { Request } from "express";
import {
  appLogSecurityRepository,
  AppLogSecurityTable,
  userStructureRepository,
  userSupervisorRepository,
  userUsagerRepository,
} from "../../../database";
import { domifaConfig } from "../../../config";
import {
  RequestBlockReason,
  ThrottleBlockedJwtUser,
  ThrottleBlockedLogContext,
} from "./app-throttler.types";
import {
  AttemptedTargetRoute,
  extractAttemptedTarget,
  extractJwtUser,
  extractLoginIdentifier,
  extractRequestHeaders,
  formatThrottleWindow,
  getAllowedOrigins,
  getBlockReason,
  isBypassedRoute,
  sanitizeForLog,
} from "./app-throttler.utils";
import {
  ANONYMOUS_ACTOR_FIELDS,
  userTypeFromProfile,
} from "../../../modules/app-logs/app-logs.helpers";
import { userStatusManager } from "../../../modules/users/services";
import { UserProfile } from "../../../_common/model";
import { getClientIp } from "../../../util/express/clientRequest.helper";

const SKIP_THROTTLE_ENVS: ReadonlySet<string> = new Set(["test"]);
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
    if (SKIP_THROTTLE_ENVS.has(envId)) {
      this.logger.debug(
        `[THROTTLE] Skipped: envId="${envId}" not in THROTTLED_ENVS`
      );
      return true;
    }

    this.logger.debug(
      `[THROTTLE] envId="${envId}" ip="${getClientIp(
        request
      )}" x-forwarded-for="${request.headers["x-forwarded-for"]}" x-real-ip="${
        request.headers["x-real-ip"]
      }" ${request.method} ${request.url}`
    );

    return super.canActivate(context);
  }

  // Rate-limit bucket key:
  // - Authenticated requests are keyed per JWT user (userProfile:userId) so big
  //   operators behind a shared NAT (e.g. Coallia) don't share a single bucket.
  //   The JWT is decoded without signature verification here (the auth guard
  //   does that later), but a forged JWT just gets its own bucket — no abuse.
  // - Anonymous traffic (login, password reset, bots) falls back to the client
  //   IP, derived from the same source of truth as logging/session fingerprint.
  protected override async getTracker(
    req: Record<string, any>
  ): Promise<string> {
    const request = req as Request;
    const jwtUser = extractJwtUser(request.headers["authorization"]);
    if (jwtUser?.userId) {
      return `user:${jwtUser.userProfile}:${jwtUser.userId}`;
    }
    return `ip:${getClientIp(request)}`;
  }

  // Global per-IP bucket: drop class/handler from the default key so a single
  // IP shares one counter across all routes per tier. Otherwise NestJS keys
  // buckets per (controller-method, IP), letting an attacker hammer each
  // endpoint up to the limit independently.
  protected override generateKey(
    _context: ExecutionContext,
    suffix: string,
    name: string
  ): string {
    return createHash("sha256").update(`${name}-${suffix}`).digest("hex");
  }

  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();

    const attemptedIdentifier = extractLoginIdentifier(request);
    const jwtUser = extractJwtUser(request.headers["authorization"]);

    const logContext: ThrottleBlockedLogContext = {
      ...throttlerLimitDetail,
      ip: sanitizeForLog(request.ip),
      userAgent: sanitizeForLog(request.headers["user-agent"]),
      method: sanitizeForLog(request.method) ?? "",
      url: sanitizeForLog(request.url) ?? "",
      jwtUser,
      attemptedIdentifier,
      headers: extractRequestHeaders(request),
    };

    // totalHits is the current TTL-window counter for the tier that reports the
    // violation. When blockDuration >= ttl (our config), the window resets while
    // the block keeps running, so totalHits during a block reflects ongoing
    // activity, NOT the value that triggered the block. We surface the threshold
    // (limit + window) as the authoritative "why blocked" and keep totalHits as
    // an ops debug signal.
    this.logger.warn(
      `[THROTTLE_BLOCKED] ip="${logContext.ip}" quota=${
        logContext.limit
      } req/${formatThrottleWindow(logContext.ttl)} activite-en-cours=${
        logContext.totalHits
      } req ${logContext.method} ${logContext.url}${
        attemptedIdentifier ? ` attempted="${attemptedIdentifier}"` : ""
      }`
    );

    const existingLogUuid = this.activeBlocks.get(throttlerLimitDetail.key);

    if (existingLogUuid) {
      try {
        await appLogSecurityRepository.update(existingLogUuid, {
          context: logContext as any,
        });
      } catch {
        // Logging is best-effort: never block the 429 response.
      }
    } else {
      const log = new AppLogSecurityTable({
        ...ANONYMOUS_ACTOR_FIELDS,
        action: "THROTTLE_BLOCKED",
        ip: logContext.ip,
        userAgent: logContext.userAgent,
        context: logContext,
      });

      try {
        const saved = await appLogSecurityRepository.save(log);
        if (saved?.uuid) {
          this.activeBlocks.set(throttlerLimitDetail.key, saved.uuid);

          const timeout = setTimeout(() => {
            this.activeBlocks.delete(throttlerLimitDetail.key);
          }, throttlerLimitDetail.ttl);
          timeout.unref();
        }
      } catch {
        // Logging is best-effort: never block the 429 response.
      }
    }

    await this.applyThrottleAutoBlock(request, jwtUser, logContext);

    // Minimal body: no "ThrottlerException: Too Many Requests" leakage about
    // which library/tier blocked. The Retry-After header is still emitted by
    // the underlying storage layer.
    throw new HttpException(
      { statusCode: HttpStatus.TOO_MANY_REQUESTS },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  // Definitive auto-block on throttle for:
  // - JWT-authenticated users (any rate-limited endpoint)
  // - Anonymous requests on login/reset endpoints where we can resolve the
  //   targeted account from the body identifier (defense against IP rotation)
  // Status goes straight to BLOCKED — admin must unlock. Mirrors the bot/UA
  // policy in maybeAutoBlockUser but covers the rate-limit path that
  // previously slipped through.
  private async applyThrottleAutoBlock(
    request: Request,
    jwtUser: ThrottleBlockedJwtUser | undefined,
    logContext: ThrottleBlockedLogContext
  ): Promise<void> {
    if (jwtUser?.userId) {
      await this.applyAutoBlock({
        userProfile: jwtUser.userProfile as UserProfile,
        userId: jwtUser.userId,
        reason: "throttle_authenticated",
        blockedUserExtra: {
          email: jwtUser.email,
          structureId: jwtUser.structureId,
          role: jwtUser.role,
        },
        context: {
          throttle: logContext,
        },
      });
      return;
    }

    const attempted = extractAttemptedTarget(request);
    if (!attempted) {
      return;
    }
    // Usagers are intentionally excluded: per-user temp lockout already kicks
    // in after FAILED_AUTH_ATTEMPTS_BEFORE_LOCK failed attempts (see
    // userSecurityEventHistoryManager). The hard auto-block status is
    // reserved for structure/supervisor. Filter is also enforced in
    // applyAutoBlock as defense-in-depth.
    if (!AUTO_BLOCK_PROFILES.has(attempted.route.userProfile)) {
      return;
    }
    const userId = await this.resolveUserIdByIdentifier(attempted);
    if (userId === null) {
      return;
    }
    await this.applyAutoBlock({
      userProfile: attempted.route.userProfile,
      userId,
      reason: "throttle_targeted",
      blockedUserExtra: {
        email: attempted.identifier,
      },
      context: {
        throttle: logContext,
        attemptedIdentifier: attempted.identifier,
        targetRoute: attempted.route.prefix,
      },
    });
  }

  private async applyAutoBlock({
    userProfile,
    userId,
    reason,
    blockedUserExtra,
    context,
  }: {
    userProfile: UserProfile;
    userId: number;
    reason: string;
    blockedUserExtra?: {
      email?: string;
      structureId?: number;
      role?: string;
    };
    context: Record<string, unknown>;
  }): Promise<void> {
    if (!AUTO_BLOCK_PROFILES.has(userProfile)) {
      return;
    }

    const currentStatus = await userStatusManager.getUserStatusFromDb({
      userProfile,
      userId,
    });
    if (currentStatus === "BLOCKED") {
      return;
    }

    await userStatusManager.markUserAsBlocked({ userProfile, userId });

    const userType = userTypeFromProfile(userProfile);
    const throttleCtx = (context["throttle"] ??
      {}) as ThrottleBlockedLogContext;
    try {
      await appLogSecurityRepository.save(
        new AppLogSecurityTable({
          // SUBJECT of the log = the target user being blocked.
          userStructureId: userType === "user_structure" ? userId : undefined,
          userSupervisorId: userType === "user_supervisor" ? userId : undefined,
          userType,
          structureId: blockedUserExtra?.structureId,
          action: "BLOCK_USER",
          ip: throttleCtx.ip,
          userAgent: throttleCtx.userAgent,
          context: {
            autoBlocked: true,
            triggeredBy: "AppThrottlerGuard",
            reason,
            ...blockedUserExtra,
            ...context,
          },
        })
      );
    } catch {
      // Best-effort: the user is already marked BLOCKED in the DB above.
    }

    this.logger.warn(
      `[AUTO_BLOCK] ${userProfile} user ${userId} blocked (reason=${reason})`
    );
  }

  private async resolveUserIdByIdentifier(attempted: {
    route: AttemptedTargetRoute;
    identifier: string;
  }): Promise<number | null> {
    const { route, identifier } = attempted;
    try {
      // Explicit dispatch: a silent fallback would route a typo or a future
      // 4th profile to the wrong table. The lookup column also differs per
      // profile (email for structure/supervisor, login for usager).
      let row: { id: number } | null;
      if (route.userProfile === "supervisor") {
        row = await userSupervisorRepository.findOne({
          where: { email: identifier.toLowerCase() },
          select: { id: true },
        });
      } else if (route.userProfile === "structure") {
        row = await userStructureRepository.findOne({
          where: { email: identifier.toLowerCase() },
          select: { id: true },
        });
      } else if (route.userProfile === "usager") {
        row = await userUsagerRepository.findOne({
          where: { login: identifier.trim().toUpperCase() },
          select: { id: true },
        });
      } else {
        return null;
      }
      return row?.id ?? null;
    } catch {
      return null;
    }
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
    const clientIp = getClientIp(request);

    // Per-user dedup when authenticated so the attempts counter accumulates
    // for that account regardless of source IP. Anonymous traffic still
    // dedup'd per IP.
    const dedupKey = jwtUser?.userId
      ? `request-block:${reason}:user:${jwtUser.userProfile}:${jwtUser.userId}`
      : `request-block:${reason}:ip:${clientIp ?? "unknown"}`;

    const baseContext: ThrottleBlockedLogContext = {
      ip: sanitizeForLog(clientIp),
      userAgent: sanitizeForLog(request.headers["user-agent"]),
      method: sanitizeForLog(request.method) ?? "",
      url: sanitizeForLog(request.url) ?? "",
      jwtUser: extractJwtUser(request.headers["authorization"]),
      reason,
      origin: sanitizeForLog(request.headers["origin"]),
      referer: sanitizeForLog(request.headers["referer"]),
      attemptedIdentifier: extractLoginIdentifier(request),
      headers: extractRequestHeaders(request),
    };

    const existingLogUuid = this.activeBlocks.get(dedupKey);

    if (existingLogUuid) {
      // Atomic increment of the attempts counter alongside the context refresh.
      // context is stored as json (not jsonb), so cast both ways.
      try {
        await appLogSecurityRepository.query(
          `UPDATE app_log_security
           SET context = jsonb_set(
             $2::jsonb,
             '{attempts}',
             to_jsonb(COALESCE((context->>'attempts')::int, 1) + 1)
           )::json
           WHERE uuid = $1`,
          [existingLogUuid, JSON.stringify(baseContext)]
        );
      } catch {
        // Best-effort logging — never block the 4xx response on log persistence.
      }
    } else {
      const log = new AppLogSecurityTable({
        ...ANONYMOUS_ACTOR_FIELDS,
        action: "REQUEST_BLOCKED",
        ip: baseContext.ip,
        userAgent: baseContext.userAgent,
        context: { ...baseContext, attempts: 1 },
      });

      try {
        const saved = await appLogSecurityRepository.save(log);
        if (saved?.uuid) {
          this.activeBlocks.set(dedupKey, saved.uuid);

          const timeout = setTimeout(() => {
            this.activeBlocks.delete(dedupKey);
          }, REQUEST_BLOCK_DEDUP_TTL_MS);
          timeout.unref();
        }
      } catch {
        // Best-effort logging — never block the 4xx response on log persistence.
      }
    }

    await this.maybeAutoBlockUser(reason, jwtUser, baseContext);
  }

  private async maybeAutoBlockUser(
    reason: RequestBlockReason,
    jwtUser: ThrottleBlockedJwtUser | undefined,
    requestContext: ThrottleBlockedLogContext
  ): Promise<void> {
    if (!jwtUser?.userId) {
      return;
    }
    if (!AUTO_BLOCK_REASONS.has(reason)) {
      return;
    }
    await this.applyAutoBlock({
      userProfile: jwtUser.userProfile as UserProfile,
      userId: jwtUser.userId,
      reason,
      blockedUserExtra: {
        email: jwtUser.email,
        structureId: jwtUser.structureId,
        role: jwtUser.role,
      },
      context: {
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        method: requestContext.method,
        url: requestContext.url,
        origin: requestContext.origin,
        referer: requestContext.referer,
      },
    });
  }
}
