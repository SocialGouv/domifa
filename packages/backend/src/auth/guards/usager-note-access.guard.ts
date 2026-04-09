import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";
import { isInt, isUUID } from "class-validator";
import { usagerNotesRepository } from "../../database";

@Injectable()
export class UsagerNoteAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    const usagerRef = Number(r.params?.usagerRef);
    const structureId = Number(r.user?.structureId);

    if (!isInt(usagerRef) || usagerRef < 0) {
      appLogger.error("[UsagerNoteAccessGuard] invalid usagerRef", {
        sentry: true,
        context: {
          url: r.url,
          usagerRef: r.params?.usagerRef,
          user: r.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    if (!isUUID(r.params?.noteUUID)) {
      appLogger.error("[UsagerNoteAccessGuard] invalid noteUUID", {
        sentry: true,
        context: {
          url: r.url,
          noteUUID: r.params?.noteUUID,
          user: r.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    if (!isInt(structureId) || structureId <= 0) {
      appLogger.error("[UsagerNoteAccessGuard] invalid structureId", {
        sentry: true,
        context: {
          structureId,
          user: r.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

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
          user: r.user.id,
          role: r.user.role,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
  }
}
