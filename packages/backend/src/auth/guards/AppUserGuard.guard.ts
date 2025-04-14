import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { addLogContext, appLogger } from "../../util";
import { UserProfile, UserStructureAuthenticated } from "../../_common/model";
import { authChecker } from "../services";
import { expiredTokenRepositiory } from "../../database";
import { UserStructureRole, UserSupervisorRole } from "@domifa/common";
import { getCurrentScope } from "@sentry/node";
import { UserSupervisorAuthenticated } from "../../_common/model/users/user-supervisor";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | UserStructureAuthenticated
      | UserSupervisorAuthenticated;

    addLogContext({
      auth: {
        user_id: user._userId,
        profile: user._userProfile,
      },
    });

    let userScope = {
      email: user.email,
      id: user._userId,
      role: user.role,
      structureId: null,
    };

    if (user._userProfile === "structure") {
      userScope = {
        ...userScope,
        structureId: user?.structureId,
      };
    }

    getCurrentScope().setUser(userScope);

    // First, take guard in method
    const methodAllowUserProfiles =
      this.reflector.get<UserProfile[]>(
        "allowUserProfiles",
        context.getHandler()
      ) || [];

    // Take Guards from class if there not set in the method
    const classAllowUserProfiles =
      this.reflector.get<UserProfile[]>(
        "allowUserProfiles",
        context.getClass()
      ) || [];

    const allowUserProfiles =
      methodAllowUserProfiles.length > 0
        ? methodAllowUserProfiles
        : classAllowUserProfiles;

    const methodAllowUserStructureRoles =
      this.reflector.get<UserStructureRole[]>(
        "allowUserStructureRoles",
        context.getHandler()
      ) || [];

    const classAllowUserStructureRoles =
      this.reflector.get<UserStructureRole[]>(
        "allowUserStructureRoles",
        context.getClass()
      ) || [];

    const allowUserStructureRoles =
      methodAllowUserStructureRoles.length > 0
        ? methodAllowUserStructureRoles
        : classAllowUserStructureRoles;

    const methodAllowUserSupervisorRoles =
      this.reflector.get<UserSupervisorRole[]>(
        "allowUserSupervisorRoles",
        context.getHandler()
      ) || [];

    const classAllowUserSupervisorRoles =
      this.reflector.get<UserSupervisorRole[]>(
        "allowUserSupervisorRoles",
        context.getClass()
      ) || [];

    // Combiner les rôles de superviseur
    const allowUserSupervisorRoles =
      methodAllowUserSupervisorRoles.length > 0
        ? methodAllowUserSupervisorRoles
        : classAllowUserSupervisorRoles;

    if (!allowUserProfiles?.length) {
      return false;
    }

    // check structure user roles
    const isValidProfile = authChecker.checkProfile(user, ...allowUserProfiles);

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
          authChecker.checkRole(user, ...allowUserStructureRoles)
        );
      }

      if (
        user._userProfile === "supervisor" &&
        allowUserSupervisorRoles?.length
      ) {
        // check structure user roles
        return authChecker.checkRole(user, ...allowUserSupervisorRoles);
      }
    }

    return false;
  }
}
