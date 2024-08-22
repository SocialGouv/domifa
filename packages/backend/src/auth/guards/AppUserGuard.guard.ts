import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { addLogContext, appLogger } from "../../util";
import { UserProfile, UserStructureAuthenticated } from "../../_common/model";
import { authChecker } from "../services";
import { expiredTokenRepositiory } from "../../database";
import { UserStructureRole } from "@domifa/common";
import { getCurrentScope } from "@sentry/node";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserStructureAuthenticated;

    addLogContext({
      auth: {
        user_id: user._userId,
        profile: user._userProfile,
        isSuperAdmin: user.isSuperAdminDomifa,
      },
    });

    if (request?.body) {
      addLogContext({
        body: request?.body,
      });
    }

    getCurrentScope().setUser({
      email: user.email,
      username:
        "STRUCTURE " + user.structureId?.toString() + " : " + user.prenom,
      id: user._userId,
      role: user.role,
      structureId: user.structureId,
    });

    let allowUserProfiles = this.reflector.get<UserProfile[]>(
      "allowUserProfiles",
      context.getHandler()
    );

    const allowUserStructureRoles = this.reflector.get<UserStructureRole[]>(
      "allowUserStructureRoles",
      context.getHandler()
    );

    if (!allowUserProfiles?.length && allowUserStructureRoles?.length) {
      allowUserProfiles = ["structure"];
    }

    if (allowUserProfiles?.length) {
      // check structure user roles
      const isValidProfile = authChecker.checkProfile(
        user,
        ...allowUserProfiles
      );

      if (isValidProfile) {
        if (
          user._userProfile === "structure" &&
          allowUserStructureRoles?.length
        ) {
          const isBlacklisted = await expiredTokenRepositiory.findOneBy({
            token: request.headers.authorization,
          });

          if (isBlacklisted) {
            appLogger.error(`[authChecker] expired token`, {
              context: { userProfile: user, user: user?._userId },
            });
          }

          // check structure user roles
          return (
            !isBlacklisted &&
            authChecker.checkProfile(user, "structure") &&
            authChecker.checkRole(
              user as UserStructureAuthenticated,
              ...allowUserStructureRoles
            )
          );
        }
      }
      return isValidProfile;
    }

    // by default: DENY
    return false;
  }
}
