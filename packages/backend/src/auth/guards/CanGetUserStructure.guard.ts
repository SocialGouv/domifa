import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";
import { isInt, isUUID } from "class-validator";
import { userStructureRepository } from "../../database";

@Injectable()
export class CanGetUserStructureGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    const userUuid = r.params?.userUuid;
    const structureId = Number(r.user?.structureId);

    if (!isUUID(userUuid)) {
      appLogger.error("[CanGetUserStructureGuard] invalid userUuid", {
        sentry: true,
        context: { userUuid, user: r.user?.id },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    if (!isInt(structureId) || structureId <= 0) {
      appLogger.error("[CanGetUserStructureGuard] invalid structureId", {
        sentry: true,
        context: { structureId: r.user?.structureId, user: r.user?.id },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    const chosenUserStructure = await userStructureRepository.findOneBy({
      uuid: userUuid,
      structureId,
    });

    if (!chosenUserStructure) {
      appLogger.error(
        "[CanGetUserStructureGuard] chosenUserStructure not found",
        {
          sentry: true,
          context: {
            userUuid,
            structureId,
            user: r.user.id,
            role: r.user.role,
          },
        }
      );
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    r.chosenUserStructure = chosenUserStructure;
    return r;
  }
}
