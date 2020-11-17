import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { appLogger } from "../../util";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const isValidRole = user && user.role === "admin";
    if (user && !isValidRole) {
      appLogger.warn(
        `[AdminGuard] invalid role "${user.role}" for user "${user._id}" with role "${user.role}"`,
        {
          sentryBreadcrumb: true,
        }
      );
      appLogger.error(`[AdminGuard] invalid role`);
    }
    return isValidRole;
  }
}
