import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";
import { structureInformationRepository } from "../../database";

@Injectable()
export class StructureInformationAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    if (
      typeof r.params.uuid === "undefined" ||
      typeof r.user.structureId === "undefined"
    ) {
      appLogger.error(
        "[StructureInformationAccessGuard] invalid uuid or structureId",
        {
          sentry: true,
          context: {
            usagerRef: r?.params?.uui,
            structureId: r?.user?.structureId,
            user: r?.user?._id,
          },
        }
      );
      throw new HttpException(
        "STRUCTURE_INFORMATION_NOT_FOUND",
        HttpStatus.BAD_REQUEST
      );
    }

    const uuid = r.params.uuid;
    const structureId = parseInt(r.user.structureId, 10);

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
          user: r?.user?._id,
          role: r?.user?.role,
        },
      });
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
  }
}
