import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { isInt } from "class-validator";

import { appLogger } from "../../util";
import { structureRepository } from "../../database";

@Injectable()
export class StructureAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    const structureId = Number(r.params?.structureId);

    if (!isInt(structureId) || structureId <= 0) {
      appLogger.error("[StructureAccessGuard] invalid structureId", {
        sentry: true,
        context: {
          structureId: r?.params?.structureId,
          user: r?.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    try {
      const structure = await structureRepository.findOneOrFail({
        where: {
          id: structureId,
          // statut: "VALIDE",
        },
      });
      r.structure = structure;
      return r;
    } catch (e) {
      appLogger.error("[UsagerAccessGuard] Structure not found", {
        sentry: true,
        context: {
          structureId,
          user: r?.user?.id,
          role: r?.user?.role,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
  }
}
