import { appLogger } from "../../util";
import {
  UserAuthenticated,
  UserProfile,
  UserStructureAuthenticated,
} from "../../_common/model";
import { UserStructureRole, UserSupervisorRole } from "@domifa/common";
import { UserSupervisorAuthenticated } from "../../_common/model/users/user-supervisor";

export type AnyRole = UserStructureRole | UserSupervisorRole;

export const authChecker = {
  checkRole,
  checkProfile,
};

function checkRole(
  userAuthanticated: UserSupervisorAuthenticated | UserStructureAuthenticated,
  ...expectedRoles: AnyRole[]
) {
  const user = userAuthanticated;

  if (!user || !user?.role) {
    return false;
  }

  const isValidRole = user && expectedRoles.includes(user.role as AnyRole);

  if (user && !isValidRole) {
    appLogger.error("[authChecker] invalid role", {
      sentry: true,
      context: { role: user.role, user: user.id, expectedRoles },
    });
  }

  return isValidRole;
}

function checkProfile(
  user: UserAuthenticated,
  ...expectedProfiles: UserProfile[]
) {
  const userProfile = user._userProfile;
  const isValidRole = user && expectedProfiles.includes(userProfile);

  if (user && !isValidRole) {
    appLogger.error("[authChecker] invalid profile", {
      context: { userProfile, user: user._userId, expectedProfiles },
    });
  }

  return isValidRole;
}
