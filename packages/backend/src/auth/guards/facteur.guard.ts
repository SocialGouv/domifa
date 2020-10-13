import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../../users/user.interface";
import { UserRole } from "../../users/user-role.type";
import { appLogger } from "../../util/AppLogger.service";

@Injectable()
export class FacteurGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  public canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const isValidRole =
      user &&
      (user.role === "admin" ||
        user.role === "responsable" ||
        user.role === "simple");
    if (user && !isValidRole) {
      appLogger.warn(
        `[FacteurGuard] invalid role "${user.role}" for user "${user._id}"`,
        {
          sentryBreadcrumb: true,
        }
      );
      appLogger.error(`[FacteurGuard] invalid role`);
    }
    return isValidRole;
  }
}
