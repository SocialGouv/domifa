import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";

import { appLogger } from "../../util";
import { getClientIp } from "../../util/express/clientRequest.helper";
import { IpBanCacheService } from "./ip-ban-cache.service";

@Injectable()
export class IpBanGuard implements CanActivate {
  public constructor(private readonly ipBanCache: IpBanCacheService) {}

  public canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== "http") {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const ip = getClientIp(request);
    if (!ip) {
      appLogger.error("[IP_BAN_GUARD] request without parseable IP", {
        sentry: true,
        context: {
          url: request.url,
          method: request.method,
          xRealIp: request.headers["x-real-ip"] ?? null,
          xForwardedFor: request.headers["x-forwarded-for"] ?? null,
          reqIp: request.ip ?? null,
        },
      });
      throw new BadRequestException();
    }
    if (this.ipBanCache.isBanned(ip)) {
      throw new BadRequestException();
    }
    return true;
  }
}
