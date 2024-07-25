import { usagerRepository } from "./../../database/services/usager/usagerRepository.service";
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";

@Injectable()
export class UsagerAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();

    if (
      typeof r.params.usagerRef === "undefined" ||
      typeof r.user.structureId === "undefined"
    ) {
      appLogger.error(`[UsagerAccessGuard] invalid usagerRef or structureId`, {
        sentry: true,
        context: {
          usagerRef: r.params.usagerRef,
          structureId: r.user.structureId,
          user: r.user._id,
        },
      });
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    const usagerRef = parseInt(r.params.usagerRef, 10);
    const structureId = parseInt(r.user.structureId, 10);

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
      appLogger.error(`[UsagerAccessGuard] usager not found`, {
        sentry: true,
        context: {
          usagerRef,
          structureId,
          user: r.user._id,
          role: r.user.role,
        },
      });
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
  }
}
