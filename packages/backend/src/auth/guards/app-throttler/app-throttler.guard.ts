import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
import { Request } from "express";
import { appLogsRepository, AppLogTable } from "../../../database";
import { domifaConfig } from "../../../config";
import { ThrottleBlockedLogContext } from "./app-throttler.types";
import { extractJwtUser } from "./app-throttler.utils";

const THROTTLED_ENVS = ["prod", "preprod"];

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly activeBlocks = new Map<string, string>();

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!THROTTLED_ENVS.includes(domifaConfig().envId)) {
      return true;
    }
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
