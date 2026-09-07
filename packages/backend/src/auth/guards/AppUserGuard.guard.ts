import {
  getPasswordChangeStatus,
  UserFonction,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getCurrentScope } from "@sentry/nestjs";
import {
  UserProfile,
  UserStructureAuthenticated,
  UserUsagerAuthenticated,
} from "../../_common/model";
import { UserSupervisorAuthenticated } from "../../_common/model/users/user-supervisor";
import {
  appLogSecurityRepository,
  AppLogSecurityTable,
  expiredTokenRepositiory,
  ExpiredTokenTable,
} from "../../database";

import { addLogContext, appLogger } from "../../util";
import { authChecker } from "../services";
import { userStatusManager } from "../../modules/users/services";
import { userTypeFromProfile } from "../../modules/app-logs/app-logs.helpers";
import {
  getClientIp,
  getClientUserAgent,
} from "../../util/express/clientRequest.helper";

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
        // 401 so the frontend clears the session on the next request from a
        // blacklisted token (account auto-blocked, manual logout, etc.).
        throw new UnauthorizedException("TOKEN_EXPIRED");
      }

      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: user._userProfile,
        userId: user._userId,
      });
      // Whitelist approach: only ACTIVE accounts pass. PENDING (not yet
      // activated), TEMPORARILY_BLOCKED (security backoff) and BLOCKED
      // (definitive) are all rejected.
      if (status !== "ACTIVE") {
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

        const ip = getClientIp(request);
        const userAgent = getClientUserAgent(request);
        const userType = userTypeFromProfile(user._userProfile);
        try {
          await appLogSecurityRepository.save(
            new AppLogSecurityTable({
              // SUBJECT = the user being denied.
              userStructureId:
                userType === "user_structure" ? user._userId : undefined,
              userSupervisorId:
                userType === "user_supervisor" ? user._userId : undefined,
              userType,
              action: "ACCESS_DENIED_NON_ACTIVE",
              ip,
              userAgent,
              context: {
                triggeredBy: "AppUserGuard",
                status,
                method: request.method,
                url: request.url,
              },
            })
          );
        } catch {
          // Best-effort: token was blacklisted just above, that's the auth
          // boundary. Logging failure should not affect the 401 response.
        }

        appLogger.error(
          `[authChecker] account not active (status=${status}), token blacklisted`,
          {
            context: { userProfile: user._userProfile, user: user?._userId },
          }
        );
        // 401 (not 403) so the frontend's auth interceptor clears the session
        // and redirects to login, instead of just showing a "forbidden" page.
        throw new UnauthorizedException("ACCOUNT_NOT_ACTIVE");
      }

      if (user._userProfile === "usager") {
        return true;
      }

      // Server-side enforcement of the annual password-renewal policy:
      // without this, a stale-password account stays fully functional
      // against every endpoint except through the Angular guard, which a
      // direct API call (curl, a replayed JWT) simply bypasses. Only
      // edit-my-password (and anything else explicitly opted out via
      // @AllowExpiredPassword) may be called once the password is EXPIRED —
      // the account still has a valid session, it just can't do anything
      // else until the password is renewed.
      const methodAllowExpiredPassword = this.reflector.get<boolean>(
        "allowExpiredPassword",
        context.getHandler()
      );
      const classAllowExpiredPassword = this.reflector.get<boolean>(
        "allowExpiredPassword",
        context.getClass()
      );
      const allowExpiredPassword =
        methodAllowExpiredPassword ?? classAllowExpiredPassword ?? false;

      if (!allowExpiredPassword) {
        const passwordDates = await userStatusManager.getPasswordDatesFromDb({
          userProfile: user._userProfile,
          userId: user._userId,
        });

        if (
          passwordDates &&
          getPasswordChangeStatus(
            passwordDates.passwordLastUpdate,
            passwordDates.createdAt
          ) === "EXPIRED"
        ) {
          // 401, not 403: the JWT itself is still valid, but the frontend
          // must treat this like an expired session (re-login), which then
          // redirects to the renewal page with a fresh passwordChangeStatus
          // — same reasoning as ACCOUNT_NOT_ACTIVE above, minus the
          // blacklist (the token must keep working for edit-my-password).
          throw new UnauthorizedException("PASSWORD_RENEWAL_REQUIRED");
        }
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
