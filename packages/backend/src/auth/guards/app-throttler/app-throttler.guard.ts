import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
import { Request } from "express";
import { appLogsRepository, AppLogTable } from "../../../database";
import { domifaConfig } from "../../../config";
import { ThrottleBlockedLogContext } from "./app-throttler.types";
import { extractJwtUser } from "./app-throttler.utils";

const SKIP_THROTTLE_ENVS = ["test"];

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger("AppThrottlerGuard");
  private readonly activeBlocks = new Map<string, string>();

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const envId = domifaConfig().envId;
    if (SKIP_THROTTLE_ENVS.includes(envId)) {
      this.logger.debug(
        `[THROTTLE] Skipped: envId="${envId}" not in THROTTLED_ENVS`
      );
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
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
}
