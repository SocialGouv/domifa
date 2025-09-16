import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";
import { isNumber, isUUID } from "class-validator";
import { usagerDocsRepository } from "../../database";
import { UserStructureAuthenticated } from "../../_common/model";

@Injectable()
export class UsagerDocAccessGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request?.user as UserStructureAuthenticated;

    if (!isUUID(request.params.docUuid) || !isNumber(user?.structureId)) {
      appLogger.error("[UsagerDocAccessGuard] invalid docUuid or structureId", {
        sentry: true,
        context: {
          docUuid: request?.params?.docUuid,
          structureId: user.structureId,
          user: user.id,
          role: user.role,
        },
      });
      throw new HttpException("USAGER_DOC_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    if (user?.role === "facteur" || user?.role === "agent") {
      throw new HttpException("CANNOT_GET_DOC", HttpStatus.UNAUTHORIZED);
    }

    const docUuid = request.params.docUuid;

    try {
      // Todo: optimize this request, generate one request with a join
      const usagerDoc = await usagerDocsRepository.findOneOrFail({
        where: {
          structureId: user.structureId,
          uuid: docUuid,
        },
      });
      request.usagerDoc = usagerDoc;
      return request;
    } catch (e) {
      appLogger.error("[UsagerDocAccessGuard] usager doc not found", {
        sentry: true,
        context: {
          docUuid: request.params.docUuid,
          structureId: user.structureId,
          user: user.id,
          role: user.role,
        },
      });
      throw new HttpException("USAGER_DOC_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
  }
}
