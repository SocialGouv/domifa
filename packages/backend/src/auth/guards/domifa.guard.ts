import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { domifaConfig } from "../../config";
import { appLogger } from "../../util";

@Injectable()
export class DomifaGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const isValidRole = this.isDomifaAdmin(user);
    if (user && !isValidRole) {
      appLogger.warn(
        `[DomifaGuard] invalid role "${user.role}" or structureId "${user.structureId}" for user "${user.uuid}" with role "${user.role}"`,
        {
          sentryBreadcrumb: true,
        }
      );
      appLogger.error(`[DomifaGuard] invalid role`);
    }
    return isValidRole;
  }

  public isDomifaAdmin(user: any) {
    return (
      !!user &&
      user.role === "admin" &&
      (user.structureId === 1 ||
        (domifaConfig().envId === "preprod" && user.structureId === 205))
    );
  }
}
