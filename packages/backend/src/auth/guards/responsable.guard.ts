import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { appLogger } from "../../util";

@Injectable()
export class ResponsableGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const isValidRole =
      user && (user.role === "admin" || user.role === "responsable");
    if (user && !isValidRole) {
      appLogger.warn(
        `[ResponsableGuard] invalid role "${user.role}" for user "${user._id}" with role "${user.role}"`,
        {
          sentryBreadcrumb: true,
        }
      );
      appLogger.error(`[ResponsableGuard] invalid role`);
    }
    return isValidRole;
  }
}
