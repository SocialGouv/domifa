import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { isInt, isUUID } from "class-validator";
import { interactionRepository } from "../../database";

import { appLogger } from "../../util";

@Injectable()
export class InteractionsGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    const interactionUuid = r.params?.interactionUuid;
    const structureId = Number(r.user?.structureId);

    if (!isUUID(interactionUuid)) {
      appLogger.error("[InteractionsGuard] invalid interactionUuid", {
        sentry: true,
        context: { interactionUuid, user: r.user?.id },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    if (!isInt(structureId) || structureId <= 0) {
      appLogger.error("[InteractionsGuard] invalid structureId", {
        sentry: true,
        context: { structureId, user: r.user?.id },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    const interaction = await interactionRepository.findOneBy({
      uuid: interactionUuid,
      structureId,
    });

    if (!interaction) {
      appLogger.error(`[InteractionsGuard] Interaction not found`, {
        sentry: true,
        context: { interactionUuid, user: r.user.id, role: r.user.role },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    r.interaction = interaction;
    return r;
  }
}
