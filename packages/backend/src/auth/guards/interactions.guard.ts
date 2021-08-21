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
  constructor() {}

  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    // Récupération de l'UUID de l'interaction
    const interactionUuid = r.params.interactionUuid;
    const structureId = r.user.structureId;

    if (interactionUuid === undefined || structureId === undefined) {
      appLogger.warn(
        `[InteractionsGuard] invalid interactionUuid "${interactionUuid}" or structureId "${structureId}" for user "${r.user._id}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(
        `[InteractionsGuard] invalid interactionUuid or structureId`
      );
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    const interaction = await interactionRepository.findOne({
      uuid: interactionUuid,
      structureId,
    });

    if (!interaction || interaction === null) {
      appLogger.warn(
        `[InteractionsGuard] Interaction not found for interactionUuid "${interactionUuid}" for user "${r.user._id}" with role "${r.user.role}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(`[InteractionsGuard] Interaction not found`);
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    r.interaction = interaction;
    return r;
  }
}
