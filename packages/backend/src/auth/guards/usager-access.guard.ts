import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { usagerLightRepository } from "../../database";
import { appLogger } from "../../util";

@Injectable()
export class UsagerAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();
    const usagerRef = r.params.usagerRef;
    const structureId = r.user.structureId;

    if (usagerRef === undefined || structureId === undefined) {
      appLogger.error(`[UsagerAccessGuard] invalid usagerRef or structureId`, {
        sentry: true,
        context: {
          usagerRef,
          structureId,
          user: r.user._id,
        },
      });
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
    const usager = await usagerLightRepository.findOne({
      ref: usagerRef,
      structureId,
    });

    if (!usager || usager === null) {
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

    r.usager = usager;
    return r;
  }
}
