import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { isInt } from "class-validator";

import { appLogger } from "../../util";
import { parseUsagerRef } from "../../_common/decorators/parse-pipes/ParseUsagerRef.pipe";
import { usagerRepository } from "../../database";

@Injectable()
export class UsagerAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    const usagerRef = parseUsagerRef(r.params?.usagerRef);
    const structureId = Number(r.user?.structureId);

    if (usagerRef === null) {
      // Malformed refs come from scans: log only, no Sentry
      appLogger.warn("[UsagerAccessGuard] invalid usagerRef", {
        context: {
          url: r.url,
          usagerRef: r.params?.usagerRef,
          user: r.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    if (!isInt(structureId) || structureId <= 0) {
      appLogger.error("[UsagerAccessGuard] invalid structureId", {
        sentry: true,
        context: {
          structureId,
          user: r.user?.id,
        },
      });
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    try {
      // Todo: optimize this request, generate one request with a join
      const usager = await usagerRepository.findOneOrFail({
        where: {
          structureId,
          ref: usagerRef,
        },
        relations: {
          entretien: true,
        },
      });
      r.usager = usager;
      return r;
    } catch (e) {
      appLogger.warn(`Requested url :${r.url}`);
      appLogger.error(
        `[UsagerAccessGuard] usager not found ${usagerRef} ${structureId}`,
        {
          sentry: true,
          context: {
            usagerRef,
            structureId,
            user: r.user.id,
            role: r.user.role,
          },
        }
      );
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
  }
}
