import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { isInt, isUUID } from "class-validator";

import { appLogger } from "../../util";
import { structureInformationRepository } from "../../database";

@Injectable()
export class StructureInformationAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    const uuid = r.params?.uuid;
    const structureId = Number(r.user?.structureId);

    if (!isUUID(uuid)) {
      appLogger.error("[StructureInformationAccessGuard] invalid uuid", {
        sentry: true,
        context: {
          uuid,
          user: r?.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    if (!isInt(structureId) || structureId <= 0) {
      appLogger.error("[StructureInformationAccessGuard] invalid structureId", {
        sentry: true,
        context: {
          structureId: r?.user?.structureId,
          user: r?.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    try {
      const structureInformation =
        await structureInformationRepository.findOneOrFail({
          where: {
            structureId,
            uuid,
          },
        });
      r.structureInformation = structureInformation;
      return r;
    } catch (e) {
      appLogger.error("[UsagerAccessGuard] structureInformation not found", {
        sentry: true,
        context: {
          uuid,
          structureId,
          user: r?.user?.id,
          role: r?.user?.role,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
  }
}
