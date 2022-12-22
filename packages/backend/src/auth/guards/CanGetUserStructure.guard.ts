import { userStructureRepository } from "../../database/services/user-structure/userStructureRepository.service";
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";

@Injectable()
export class CanGetUserStructureGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();
    const userId = r.params.userId;
    const structureId = r.user.structureId;

    if (userId === undefined || structureId === undefined) {
      appLogger.error(
        `[CanGetUserStructureGuard] invalid user.Uuid or structureId`,
        {
          sentry: true,
          context: { "user.Uuid": userId, structureId, user: r.user._id },
        }
      );
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }
    // TODO: remplacer par une jointure
    const chosenUserStructure = await userStructureRepository.findOne(
      {
        id: userId,
        structureId,
      },
      {
        select: "ALL",
        throwErrorIfNotFound: false,
      }
    );

    if (!chosenUserStructure) {
      appLogger.error(
        `[CanGetUserStructureGuard] chosenUserStructure not found`,
        {
          sentry: true,
          context: { userId, structureId, user: r.user._id, role: r.user.role },
        }
      );
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }

    r.chosenUserStructure = chosenUserStructure;
    return r;
  }
}
