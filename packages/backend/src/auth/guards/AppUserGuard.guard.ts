import {
  UserFonction,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getCurrentScope } from "@sentry/nestjs";
import {
  UserProfile,
  UserStructureAuthenticated,
  UserUsagerAuthenticated,
} from "../../_common/model";
import { UserSupervisorAuthenticated } from "../../_common/model/users/user-supervisor";
import { expiredTokenRepositiory, ExpiredTokenTable } from "../../database";

import { addLogContext, appLogger } from "../../util";
import { authChecker } from "../services";
import { userStatusManager } from "../../modules/users/services";

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
      fonction?: UserFonction | null;
      fonctionDetail?: string | null;
    } = {
      id: user._userId,
      structureId: null,
    };

    if (user._userProfile === "structure") {
      userScope = {
        ...userScope,
        role: user?.role,
        fonction: user?.fonction,
        fonctionDetail: user?.fonctionDetail,
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
      const isBlacklisted = await expiredTokenRepositiory.findOneBy({
        token: request.headers.authorization,
      });

      if (isBlacklisted) {
        appLogger.error(`[authChecker] expired token`, {
          context: { userProfile: user, user: user?._userId },
        });
        return false;
      }

      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: user._userProfile,
        userId: user._userId,
      });
      if (status === "BLOCKED") {
        // Lazy revocation: blacklist this token so the next attempt is rejected
        // by the cheap expired_token check without a status lookup.
        await expiredTokenRepositiory.save(
          new ExpiredTokenTable({
            token: request.headers.authorization,
            userId: user._userId,
            userProfile: user._userProfile,
            structureId:
              user._userProfile === "structure"
                ? (user as UserStructureAuthenticated).structureId
                : null,
          })
        );
        appLogger.error(`[authChecker] account blocked, token blacklisted`, {
          context: { userProfile: user._userProfile, user: user?._userId },
        });
        return false;
      }

      if (user._userProfile === "usager") {
        return true;
      }

      if (
        user._userProfile === "structure" &&
        allowUserStructureRoles?.length
      ) {
        return authChecker.checkRole(user, ...allowUserStructureRoles);
      }

      if (
        user._userProfile === "supervisor" &&
        allowUserSupervisorRoles?.length
      ) {
        return authChecker.checkRole(user, ...allowUserSupervisorRoles);
      }
    }

    return false;
  }
}
