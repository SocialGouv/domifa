import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";
import { isUUID } from "class-validator";
import { newUserStructureRepository } from "../../database";

@Injectable()
export class CanGetUserStructureGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();
    const userUuid = r.params.userUuid;
    const structureId = r.user.structureId;

    if (
      userUuid === undefined ||
      structureId === undefined ||
      !isUUID(userUuid)
    ) {
      appLogger.error(
        `[CanGetUserStructureGuard] invalid user.Uuid or structureId`,
        {
          sentry: true,
          context: { "user.Uuid": userUuid, structureId, user: r.user._id },
        }
      );
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }
    const chosenUserStructure = await newUserStructureRepository.findOneBy({
      uuid: userUuid,
      structureId,
    });

    if (!chosenUserStructure) {
      appLogger.error(
        `[CanGetUserStructureGuard] chosenUserStructure not found`,
        {
          sentry: true,
          context: {
            userUuid,
            structureId,
            user: r.user._id,
            role: r.user.role,
          },
        }
      );
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }

    r.chosenUserStructure = chosenUserStructure;
    return r;
  }
}
