import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { usagerLightRepository } from "../../database";
import { appLogger } from "../../util";

@Injectable()
export class UsagerAccessGuard implements CanActivate {
  constructor() {}

  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();
    const usagerRef = r.params.usagerRef;
    const structureId = r.user.structureId;

    if (usagerRef === undefined || structureId === undefined) {
      appLogger.warn(
        `[UsagerAccessGuard] invalid usagerRef "${usagerRef}" or structureId "${structureId}" for user "${r.user._id}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(`[UsagerAccessGuard] invalid usagerRef or structureId`);
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
    const usager = await usagerLightRepository.findOne({
      ref: usagerRef,
      structureId,
    });

    if (!usager || usager === null) {
      appLogger.warn(
        `[UsagerAccessGuard] usager not found for usagerRef "${usagerRef}" or structureId "${structureId}" for user "${r.user._id}" with role "${r.user.role}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(`[UsagerAccessGuard] usager not found`);
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    r.usager = usager;
    return r;
  }
}
