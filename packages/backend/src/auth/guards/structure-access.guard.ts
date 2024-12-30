import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";
import { structureRepository } from "../../database";

@Injectable()
export class StructureAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    if (!r?.params?.structureId || !r?.user?.isSuperAdminDomifa) {
      appLogger.error("[StructureAccessGuard] invalid structureId for admin", {
        sentry: true,
        context: {
          usagerRef: r?.params?.uui,
          structureId: r?.user?.structureId,
          user: r?.user?._id,
        },
      });
      throw new HttpException(
        "STRUCTURE_INFORMATION_NOT_FOUND",
        HttpStatus.BAD_REQUEST
      );
    }

    const structureId = parseInt(r.params.structureId, 10);

    try {
      const structure = await structureRepository.findOneOrFail({
        where: {
          id: structureId,
        },
      });
      r.structure = structure;
      return r;
    } catch (e) {
      appLogger.error("[UsagerAccessGuard] Structure not found", {
        sentry: true,
        context: {
          structureId,
          user: r?.user?._id,
          role: r?.user?.role,
        },
      });
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
  }
}
