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
  ThrottleBlockedLogContext,
} from "./app-throttler.types";
import {
  extractJwtUser,
  getAllowedOrigins,
  getBlockReason,
  isHealthzRoute,
} from "./app-throttler.utils";
import { ANONYMOUS_ACTOR_FIELDS } from "../../../modules/app-logs/app-logs.helpers";

const SKIP_THROTTLE_ENVS = ["test"];
const REQUEST_BLOCK_DEDUP_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger("AppThrottlerGuard");
  private readonly activeBlocks = new Map<string, string>();
  private readonly allowedOrigins = getAllowedOrigins();

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Bypass machine-to-machine probes (k8s liveness/readiness).
    if (isHealthzRoute(request.url)) {
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
      ip: request.ip,
      userAgent: request.headers["user-agent"],
      method: request.method,
      url: request.url,
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

  private async logRequestBlock(
    request: Request,
    reason: RequestBlockReason
  ): Promise<void> {
    // Distinct key namespace from throttler keys (which look like
    // "<tracker>-<route>"); same Map reused to keep one source of truth.
    const dedupKey = `request-block:${reason}:${request.ip ?? "unknown"}`;

    const origin = request.headers["origin"];
    const referer = request.headers["referer"];

    const logContext: ThrottleBlockedLogContext = {
      ip: request.ip,
      userAgent: request.headers["user-agent"],
      method: request.method,
      url: request.url,
      jwtUser: extractJwtUser(request.headers["authorization"]),
      reason,
      origin: typeof origin === "string" ? origin : undefined,
      referer: typeof referer === "string" ? referer : undefined,
    };

    const existingLogUuid = this.activeBlocks.get(dedupKey);

    if (existingLogUuid) {
      await appLogsRepository
        .update(existingLogUuid, { context: logContext as any })
        .catch(() => undefined);
      return;
    }

    const log = new AppLogTable({
      ...ANONYMOUS_ACTOR_FIELDS,
      action: "REQUEST_BLOCKED",
      context: logContext,
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
}
