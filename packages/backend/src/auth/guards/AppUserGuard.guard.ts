import { UserStructureRole, UserSupervisorRole } from "@domifa/common";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getCurrentScope } from "@sentry/node";
import {
  UserProfile,
  UserStructureAuthenticated,
  UserUsagerAuthenticated,
} from "../../_common/model";
import { UserSupervisorAuthenticated } from "../../_common/model/users/user-supervisor";
import { expiredTokenRepositiory } from "../../database";
import { addLogContext, appLogger } from "../../util";
import { authChecker } from "../services";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | UserUsagerAuthenticated
      | UserStructureAuthenticated
      | UserSupervisorAuthenticated;

    addLogContext({
      auth: {
        user_id: user._userId,
        profile: user._userProfile,
      },
    });

    let userScope: {
      id: number;
      structureId?: number | null;
      role?: UserSupervisorRole | UserStructureRole;
      email?: string | null;
    } = {
      id: user._userId,
      structureId: null,
    };

    if (user._userProfile === "structure") {
      userScope = {
        ...userScope,
        role: user?.role,
        email: user?.email,
        structureId: user?.structureId,
      };
    } else if (user._userProfile === "supervisor") {
      userScope = {
        ...userScope,
        role: user?.role,
        email: user?.email,
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
      if (user._userProfile === "usager") {
        return true;
      }

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
