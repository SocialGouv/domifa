import { userStructureRepository } from "../../database/services/user-structure/userStructureRepository.service";
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { appLogger } from "../../util";

@Injectable()
export class CanGetUserStructureGuard implements CanActivate {
  constructor() {}

  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();
    const userId = r.params.userId;
    const structureId = r.user.structureId;

    if (userId === undefined || structureId === undefined) {
      appLogger.warn(
        `[CanGetUserStructureGuard] invalid user.Uuid "${userId}" or structureId "${structureId}" for user "${r.user._id}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(
        `[CanGetUserStructureGuard] invalid user.Uuid or structureId`
      );
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }
    const chosenUserStructure = await userStructureRepository.findOne(
      {
        id: userId,
        structureId,
      },
      {
        select: "ALL",
        throwErrorIfNotFound: false,
      }
    );

    if (!chosenUserStructure || chosenUserStructure === null) {
      appLogger.warn(
        `[CanGetUserStructureGuard] chosenUserStructure not found for userId "${userId}" or structureId "${structureId}" for user "${r.user._id}" with role "${r.user.role}"`,
        { sentryBreadcrumb: true }
      );
      appLogger.error(
        `[CanGetUserStructureGuard] chosenUserStructure not found`
      );
      throw new HttpException("Invalid structureId", HttpStatus.FORBIDDEN);
    }

    r.chosenUserStructure = chosenUserStructure;
    return r;
  }
}
