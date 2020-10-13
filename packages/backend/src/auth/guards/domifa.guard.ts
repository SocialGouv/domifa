import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../users/user-role.type";
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
      appLogger.warn(`[DomifaGuard] roles is not defined!`, {
        sentryBreadcrumb: true,
      });
      return true;
    }

    const isValidRole =
<<<<<<< HEAD
      !!user &&
=======
      user &&
>>>>>>> feat(Sécurité): revue de sécurité sur les endpoint API #855
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
<<<<<<< HEAD
    console.log("xxx DomifaGuard isValidRole:", isValidRole);
=======
>>>>>>> feat(Sécurité): revue de sécurité sur les endpoint API #855
    return isValidRole;
  }
}
