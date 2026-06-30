import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  getOptionsToken,
  InjectThrottlerStorage,
  ThrottlerGuard,
  ThrottlerLimitDetail,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from "@nestjs/throttler";
import { createHash } from "node:crypto";
import { Request } from "express";

import { domifaConfig } from "../../../config";
import {
  appLogSecurityRepository,
  AppLogSecurityTable,
} from "../../../database";
import {
  ANONYMOUS_ACTOR_FIELDS,
  userTypeFromProfile,
} from "../../../modules/app-logs/app-logs.helpers";
import {
  resolveUserForSecurityLog,
  UserSecurityLogProfile,
} from "../../../modules/app-logs/app-log-security-user-resolver";
import { IpBanCacheService } from "../../../modules/ip-ban";
import { userStatusManager } from "../../../modules/users/services";
import { UserProfile } from "../../../_common/model";
import { appLogger } from "../../../util";
import { getClientIp } from "../../../util/express/clientRequest.helper";
import {
  AttemptedTargetRoute,
  RequestBlockReason,
  ThrottleBlockedJwtUser,
  ThrottleBlockedLogContext,
} from "./app-throttler.types";
import {
  extractAttemptedTarget,
  extractRequestHeaders,
  extractVerifiedJwtUser,
  formatThrottleWindow,
  getAllowedOrigins,
  getBlockReason,
  isBypassedRoute,
  isInternalProbeRoute,
  sanitizeForLog,
} from "./app-throttler.utils";
import { getIpBanPolicyForTtl } from "./throttler.config";
import { AppIpBanReason } from "../../../database/entities/app-ip-ban/AppIpBanTable.typeorm";

const ROUTE_PROFILE_TO_RESOLVER: Record<
  AttemptedTargetRoute["userProfile"],
  UserSecurityLogProfile
> = {
  structure: "user_structure",
  supervisor: "user_supervisor",
  usager: "usager",
};

type AttemptedTarget = { route: AttemptedTargetRoute; identifier: string };

const SKIP_THROTTLE_ENVS: ReadonlySet<string> = new Set(["test"]);
const REQUEST_BLOCK_DEDUP_TTL_MS = 5 * 60 * 1000;
// Auto-block lifted by the expired-temporary-block cron once this window has
// elapsed (see expired-temporary-block-cleaner.service.ts which honors the
// `lockUntil` we stamp in the BLOCK_USER log context).
const THROTTLE_LOCKOUT_DURATION_MS = 60 * 60 * 1000;

const AUTO_BLOCK_REQUEST_REASONS: ReadonlySet<RequestBlockReason> = new Set([
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
  private readonly jwtSecret = domifaConfig().security.jwtSecret;
  private readonly internalUserAgent =
    domifaConfig().security.internalUserAgent;

  public constructor(
    @Inject(getOptionsToken()) options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly ipBanCache: IpBanCacheService
  ) {
    super(options, storageService, reflector);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (isBypassedRoute(request.url)) {
      return true;
    }

    if (
      isInternalProbeRoute(request.url) &&
      this.isInternalProbe(request.headers["user-agent"])
    ) {
      return true;
    }

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

  private isInternalProbe(userAgent: string | string[] | undefined): boolean {
    if (!this.internalUserAgent || typeof userAgent !== "string") {
      return false;
    }
    return userAgent === this.internalUserAgent;
  }

  protected override async getTracker(
    req: Record<string, any>
  ): Promise<string> {
    const request = req as Request;
    const jwtUser = extractVerifiedJwtUser(
      request.headers["authorization"],
      this.jwtSecret
    );
    if (jwtUser?.userId) {
      return `user:${jwtUser.userProfile}:${jwtUser.userId}`;
    }
    const ip = getClientIp(request);
    return ip ? `ip:${ip}` : "ip:unknown";
  }

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
    const clientIp = getClientIp(request);
    const userAgent = sanitizeForLog(request.headers["user-agent"]);
    const jwtUser = extractVerifiedJwtUser(
      request.headers["authorization"],
      this.jwtSecret
    );
    const attemptedTarget = extractAttemptedTarget(request);

    const logContext: ThrottleBlockedLogContext = {
      ...throttlerLimitDetail,
      ip: sanitizeForLog(clientIp),
      userAgent,
      method: sanitizeForLog(request.method) ?? "",
      url: sanitizeForLog(request.url) ?? "",
      jwtUser,
      attemptedIdentifier: attemptedTarget?.identifier,
      headers: extractRequestHeaders(request),
    };

    this.logger.warn(
      `[THROTTLE_BLOCKED] ip="${logContext.ip}" quota=${
        logContext.limit
      } req/${formatThrottleWindow(logContext.ttl)} activite-en-cours=${
        logContext.totalHits
      } req ${logContext.method} ${logContext.url}${
        logContext.attemptedIdentifier
          ? ` attempted="${logContext.attemptedIdentifier}"`
          : ""
      }`
    );

    await this.persistDedupedSecurityLog({
      dedupKey: throttlerLimitDetail.key,
      action: "THROTTLE_BLOCKED",
      ip: logContext.ip,
      userAgent,
      context: logContext,
      dedupTtlMs: throttlerLimitDetail.ttl,
    });

    await this.banAndAuditIp({
      ip: clientIp,
      reason: "THROTTLE_VIOLATION",
      ...this.buildThrottleBanPayload(throttlerLimitDetail, logContext),
    });

    await this.applyThrottleAutoBlock(jwtUser, attemptedTarget, logContext);

    throw new HttpException(
      { statusCode: HttpStatus.TOO_MANY_REQUESTS },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  private async logRequestBlock(
    request: Request,
    reason: RequestBlockReason
  ): Promise<void> {
    const clientIp = getClientIp(request);
    const userAgent = sanitizeForLog(request.headers["user-agent"]);
    const jwtUser = extractVerifiedJwtUser(
      request.headers["authorization"],
      this.jwtSecret
    );
    const attemptedTarget = extractAttemptedTarget(request);

    const dedupKey = jwtUser?.userId
      ? `request-block:${reason}:user:${jwtUser.userProfile}:${jwtUser.userId}`
      : `request-block:${reason}:ip:${clientIp || "unknown"}`;

    const baseContext: ThrottleBlockedLogContext = {
      ip: sanitizeForLog(clientIp),
      userAgent,
      method: sanitizeForLog(request.method) ?? "",
      url: sanitizeForLog(request.url) ?? "",
      jwtUser,
      reason,
      origin: sanitizeForLog(request.headers["origin"]),
      referer: sanitizeForLog(request.headers["referer"]),
      attemptedIdentifier: attemptedTarget?.identifier,
      headers: extractRequestHeaders(request),
    };

    await this.persistDedupedSecurityLog({
      dedupKey,
      action: "REQUEST_BLOCKED",
      ip: baseContext.ip,
      userAgent,
      context: baseContext,
      dedupTtlMs: REQUEST_BLOCK_DEDUP_TTL_MS,
      incrementAttempts: true,
    });

    await this.maybeAutoBlockUser(
      reason,
      jwtUser,
      attemptedTarget,
      baseContext
    );

    if (AUTO_BLOCK_REQUEST_REASONS.has(reason) && clientIp) {
      await this.banAndAuditIp({
        ip: clientIp,
        reason: reason === "bot_ua" ? "BOT_UA" : "MISSING_UA",
        expiresAt: null,
        context: {
          requestReason: reason,
          url: baseContext.url,
          origin: baseContext.origin,
        },
        triggeredBy: "AppThrottlerGuard.logRequestBlock",
        userAgent,
      });
    }
  }

  private async persistDedupedSecurityLog(params: {
    dedupKey: string;
    action: "THROTTLE_BLOCKED" | "REQUEST_BLOCKED";
    ip: string | undefined;
    userAgent: string | undefined;
    context: ThrottleBlockedLogContext;
    dedupTtlMs: number;
    incrementAttempts?: boolean;
  }): Promise<void> {
    const existingUuid = this.activeBlocks.get(params.dedupKey);
    if (existingUuid) {
      try {
        if (params.incrementAttempts) {
          await appLogSecurityRepository.query(
            `UPDATE app_log_security
             SET context = jsonb_set(
               $2::jsonb,
               '{attempts}',
               to_jsonb(COALESCE((context->>'attempts')::int, 1) + 1)
             )::json
             WHERE uuid = $1`,
            [existingUuid, JSON.stringify(params.context)]
          );
        } else {
          await appLogSecurityRepository.update(existingUuid, {
            context: params.context as any,
          });
        }
      } catch {}
      return;
    }

    const initialContext = params.incrementAttempts
      ? { ...params.context, attempts: 1 }
      : params.context;
    const log = new AppLogSecurityTable({
      ...ANONYMOUS_ACTOR_FIELDS,
      action: params.action,
      ip: params.ip,
      userAgent: params.userAgent,
      context: initialContext,
    });
    try {
      const saved = await appLogSecurityRepository.save(log);
      if (saved?.uuid) {
        this.activeBlocks.set(params.dedupKey, saved.uuid);
        const t = setTimeout(() => {
          this.activeBlocks.delete(params.dedupKey);
        }, params.dedupTtlMs);
        t.unref();
      }
    } catch {}
  }

  private async banAndAuditIp(params: {
    ip: string;
    reason: AppIpBanReason;
    expiresAt: Date | null;
    context: Record<string, unknown>;
    triggeredBy: string;
    userAgent: string | undefined;
  }): Promise<void> {
    if (!params.ip) {
      return;
    }
    try {
      await this.ipBanCache.banIp({
        ip: params.ip,
        reason: params.reason,
        expiresAt: params.expiresAt,
        context: params.context,
        createdBy: `system:${params.triggeredBy}`,
        triggeredBy: params.triggeredBy,
        userAgent: params.userAgent,
      });
    } catch (err) {
      appLogger.error("[IP_BAN] failed to persist ban", {
        sentry: true,
        error: err,
        context: {
          ip: params.ip,
          reason: params.reason,
          triggeredBy: params.triggeredBy,
          expiresAt: params.expiresAt?.toISOString() ?? null,
        },
      });
      return;
    }
    try {
      await appLogSecurityRepository.save(
        new AppLogSecurityTable({
          ...ANONYMOUS_ACTOR_FIELDS,
          action: "IP_BANNED",
          ip: params.ip,
          userAgent: params.userAgent,
          context: {
            ...params.context,
            expiresAt: params.expiresAt?.toISOString() ?? null,
            triggeredBy: params.triggeredBy,
          },
        })
      );
    } catch {
      // best-effort
    }
  }

  private buildThrottleBanPayload(
    throttlerLimitDetail: ThrottlerLimitDetail,
    logContext: ThrottleBlockedLogContext
  ): {
    expiresAt: Date | null;
    context: Record<string, unknown>;
    triggeredBy: string;
    userAgent: string | undefined;
  } {
    const { tierName, expiresAt } = getIpBanPolicyForTtl(
      throttlerLimitDetail.ttl
    );
    return {
      expiresAt,
      context: {
        tier: tierName,
        url: logContext.url,
        method: logContext.method,
        jwtUserId: logContext.jwtUser?.userId,
      },
      triggeredBy: "AppThrottlerGuard.throwThrottlingException",
      userAgent: logContext.userAgent,
    };
  }

  private async applyThrottleAutoBlock(
    jwtUser: ThrottleBlockedJwtUser | undefined,
    attemptedTarget: AttemptedTarget | undefined,
    logContext: ThrottleBlockedLogContext
  ): Promise<void> {
    if (jwtUser?.userId) {
      await this.applyAutoBlock({
        userProfile: jwtUser.userProfile as UserProfile,
        userId: jwtUser.userId,
        reason: "throttle_authenticated",
        ip: logContext.ip,
        userAgent: logContext.userAgent,
        blockedUserExtra: this.buildBlockedUserExtra(jwtUser),
        extra: { throttle: logContext },
      });
      return;
    }
    if (attemptedTarget) {
      await this.applyAutoBlockForTarget(
        attemptedTarget,
        "throttle_targeted",
        logContext,
        "temporary"
      );
    }
  }

  private async maybeAutoBlockUser(
    reason: RequestBlockReason,
    jwtUser: ThrottleBlockedJwtUser | undefined,
    attemptedTarget: AttemptedTarget | undefined,
    requestContext: ThrottleBlockedLogContext
  ): Promise<void> {
    if (!AUTO_BLOCK_REQUEST_REASONS.has(reason)) {
      return;
    }
    if (jwtUser?.userId) {
      await this.applyAutoBlock({
        userProfile: jwtUser.userProfile as UserProfile,
        userId: jwtUser.userId,
        reason,
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        blockedUserExtra: this.buildBlockedUserExtra(jwtUser),
        extra: {
          method: requestContext.method,
          url: requestContext.url,
          origin: requestContext.origin,
          referer: requestContext.referer,
        },
      });
      return;
    }
    if (attemptedTarget) {
      await this.applyAutoBlockForTarget(
        attemptedTarget,
        `${reason}_targeted`,
        requestContext,
        "temporary"
      );
    }
  }

  // Resolves the email/login submitted in the request body to the matching
  // user row and applies the auto-block. Unknown identifiers are ignored
  // (resolver returns "anonymous").
  private async applyAutoBlockForTarget(
    attemptedTarget: AttemptedTarget,
    reason: string,
    requestContext: ThrottleBlockedLogContext,
    lockType: "permanent" | "temporary"
  ): Promise<void> {
    const resolverProfile =
      ROUTE_PROFILE_TO_RESOLVER[attemptedTarget.route.userProfile];
    const resolved = await resolveUserForSecurityLog(
      resolverProfile,
      attemptedTarget.identifier
    );
    const userId =
      resolved.userStructureId ??
      resolved.userSupervisorId ??
      resolved.userUsagerId;
    if (!userId) {
      return;
    }
    await this.applyAutoBlock({
      userProfile: attemptedTarget.route.userProfile as UserProfile,
      userId,
      reason,
      ip: requestContext.ip,
      userAgent: requestContext.userAgent,
      blockedUserExtra: {
        email: attemptedTarget.identifier,
        structureId: resolved.structureId,
        role: resolved.role,
      },
      extra: {
        method: requestContext.method,
        url: requestContext.url,
        origin: requestContext.origin,
        referer: requestContext.referer,
        attemptedIdentifier: attemptedTarget.identifier,
      },
      lockType,
    });
  }

  private buildBlockedUserExtra(jwtUser: ThrottleBlockedJwtUser): {
    email?: string;
    structureId?: number;
    role?: string;
  } {
    return {
      email: jwtUser.email,
      structureId: jwtUser.structureId,
      role: jwtUser.role,
    };
  }

  private async applyAutoBlock({
    userProfile,
    userId,
    reason,
    ip,
    userAgent,
    blockedUserExtra,
    extra,
    lockType = "permanent",
  }: {
    userProfile: UserProfile;
    userId: number;
    reason: string;
    ip: string | undefined;
    userAgent: string | undefined;
    blockedUserExtra?: {
      email?: string;
      structureId?: number;
      role?: string;
    };
    extra?: Record<string, unknown>;
    lockType?: "permanent" | "temporary";
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

    let lockUntil: string | undefined;
    if (lockType === "temporary") {
      await userStatusManager.markUserAsTemporarilyBlocked({
        userProfile,
        userId,
      });
      lockUntil = new Date(
        Date.now() + THROTTLE_LOCKOUT_DURATION_MS
      ).toISOString();
    } else {
      await userStatusManager.markUserAsBlocked({ userProfile, userId });
    }

    const userType = userTypeFromProfile(userProfile);
    try {
      await appLogSecurityRepository.save(
        new AppLogSecurityTable({
          userStructureId: userType === "user_structure" ? userId : undefined,
          userSupervisorId: userType === "user_supervisor" ? userId : undefined,
          userType,
          structureId: blockedUserExtra?.structureId,
          action: "BLOCK_USER",
          ip,
          userAgent,
          context: {
            autoBlocked: true,
            triggeredBy: "AppThrottlerGuard",
            lockType,
            ...(lockUntil ? { lockUntil } : {}),
            reason,
            ...blockedUserExtra,
            ...extra,
          },
        })
      );
    } catch {
      // best-effort: status change is already persisted
    }

    this.logger.warn(
      `[AUTO_BLOCK] ${userProfile} user ${userId} ${
        lockType === "temporary" ? "temporarily " : ""
      }blocked (reason=${reason})`
    );
  }
}
