import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { appLogger } from "../../util";

import { UsagersService } from "../../usagers/services/usagers.service";

@Injectable()
export class UsagerAccessGuard implements CanActivate {
  constructor(private readonly usagersService: UsagersService) {}

  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();
    const usagerId = r.params.id;
    const structureId = r.user.structureId;
    if (usagerId === undefined || structureId === undefined) {
      appLogger.warn(
        `[UsagerAccessGuard] invalid usagerId "${usagerId}" or structureId "${structureId}" for user "${r.user._id}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(`[UsagerAccessGuard] invalid usagerId or structureId`);
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
    const usager = await this.usagersService.findById(usagerId, structureId);

    if (!usager || usager === null) {
      appLogger.warn(
        `[UsagerAccessGuard] usager not found for usagerId "${usagerId}" or structureId "${structureId}" for user "${r.user._id}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(`[UsagerAccessGuard] usager not found`);
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    r.usager = usager;
    return r;
  }
}
