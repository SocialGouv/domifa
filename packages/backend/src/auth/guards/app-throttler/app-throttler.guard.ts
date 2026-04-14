import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
import { Request } from "express";
import { appLogsRepository } from "../../../database/services/app-log";
import { AppLogTable } from "../../../database/entities/app-log/AppLogTable.typeorm";
import { ThrottleBlockedLogContext } from "./app-throttler.types";
import { extractJwtUser } from "./app-throttler.utils";

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();

    const logContext: ThrottleBlockedLogContext = {
      ip: request.ip,
      userAgent: request.headers["user-agent"],
      method: request.method,
      url: request.url,
      throttlerName: throttlerLimitDetail.key,
      limit: throttlerLimitDetail.limit,
      ttl: throttlerLimitDetail.ttl,
      totalHits: throttlerLimitDetail.totalHits,
      jwtUser: extractJwtUser(request.headers["authorization"]),
    };

    // Fire-and-forget : on ne bloque pas la réponse 429 si le log échoue
    appLogsRepository
      .save(
        new AppLogTable({ action: "THROTTLE_BLOCKED", context: logContext })
      )
      .catch(() => undefined);

    return super.throwThrottlingException(context, throttlerLimitDetail);
  }
}
