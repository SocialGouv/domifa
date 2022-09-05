import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { interactionRepository } from "../../database";

import { appLogger } from "../../util";

@Injectable()
export class InteractionsGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    // Récupération de l'UUID de l'interaction
    const interactionUuid = r.params.interactionUuid;
    const structureId = r.user.structureId;

    if (interactionUuid === undefined || structureId === undefined) {
      appLogger.error(
        `[InteractionsGuard] invalid interactionUuid or structureId`,
        {
          sentry: true,
          context: { interactionUuid, structureId, user: r.user._id },
        }
      );
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    const interaction = await interactionRepository.findOneBy({
      uuid: interactionUuid,
      structureId,
    });

    if (!interaction) {
      appLogger.error(`[InteractionsGuard] Interaction not found`, {
        sentry: true,
        context: { interactionUuid, user: r.user._id, role: r.user.role },
      });
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    r.interaction = interaction;
    return r;
  }
}
