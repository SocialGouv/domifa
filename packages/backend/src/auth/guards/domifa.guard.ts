import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "../../config";
import { appLogger } from "../../util";

@Injectable()
export class DomifaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) { }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }

    const isValidRole =
      !!user &&
      user.role === "admin" &&
      (user.structureId === 1 ||
        (this.configService.getEnvId() === "preprod" &&
          user.structureId === 205));
    if (user && !isValidRole) {
      appLogger.warn(
        `[DomifaGuard] invalid role "${user.role}" or structureId "${user.structureId}" for user "${user._id}"`,
        {
          sentryBreadcrumb: true,
        }
      );
      appLogger.error(`[DomifaGuard] invalid role`);
    }
    console.log("xxx DomifaGuard isValidRole:", isValidRole);
    return isValidRole;
  }
}
