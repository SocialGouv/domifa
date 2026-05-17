import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { isUUID } from "class-validator";

import { appLogger } from "../../util";
import { structureRepository } from "../../database";

// Route param resolved by this guard. Switched from the sequential int `id`
// to the random `uuid` to remove the enumeration attack surface that lets an
// attacker iterate /admin/structures/structure/1, /2, /3, ...
@Injectable()
export class StructureAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    const structureUuid = r.params?.structureUuid;

    if (typeof structureUuid !== "string" || !isUUID(structureUuid)) {
      appLogger.error("[StructureAccessGuard] invalid structureUuid", {
        sentry: true,
        context: {
          structureUuid: r?.params?.structureUuid,
          user: r?.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    try {
      const structure = await structureRepository.findOneOrFail({
        where: {
          uuid: structureUuid,
        },
      });
      r.structure = structure;
      return r;
    } catch (e) {
      appLogger.error("[StructureAccessGuard] Structure not found", {
        sentry: true,
        context: {
          structureUuid,
          user: r?.user?.id,
          role: r?.user?.role,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
  }
}
