import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";
import { IsInt, isUUID } from "class-validator";
import { usagerNotesRepository } from "../../database";

@Injectable()
export class UsagerNoteAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    if (
      !IsInt(r.params.usagerRef) ||
      !isUUID(r.params.noteUUID) ||
      typeof r.user.structureId === "undefined"
    ) {
      appLogger.error(
        "[UsagerNotesAccessGuard] invalid usagerRef or structureId",
        {
          sentry: true,
          context: {
            url: r.url,
            usagerRef: r.params.usagerRef,
            structureId: r.user.structureId,
            user: r.user._id,
          },
        }
      );
      throw new HttpException("USAGER_NOTE_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    const usagerRef = parseInt(r.params.usagerRef, 10);
    const structureId = parseInt(r.user.structureId, 10);

    try {
      const usagerNote = await usagerNotesRepository.findOneOrFail({
        where: {
          structureId,
          usagerRef,
          uuid: r.params.noteUUID,
        },
      });

      r.usagerNote = usagerNote;
      return r;
    } catch (e) {
      appLogger.error(e);
      appLogger.error("[UsagerNoteAccessGuard] usager note not found", {
        sentry: true,
        context: {
          usagerRef,
          structureId,
          user: r.user._id,
          role: r.user.role,
        },
      });
      throw new HttpException("USAGER_NOTE_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
  }
}
