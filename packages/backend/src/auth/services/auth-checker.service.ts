import { appLogger } from "../../util";
import {
  UserAuthenticated,
  UserProfile,
  UserStructure,
  UserStructureRole,
} from "../../_common/model";

export const authChecker = {
  checkRole,
  checkProfile,
  isDomifaAdmin,
};

function checkRole(
  user: Pick<UserStructure, "id" | "role">,
  ...expectedRoles: UserStructureRole[]
) {
  const isValidRole = user && expectedRoles.includes(user.role);

  if (user && !isValidRole) {
    appLogger.warn(
      `[authChecker] invalid role "${user.role}" for user "${
        user.id
      }" (expected: ${expectedRoles.join(",")})"`,
      {
        sentryBreadcrumb: true,
      }
    );
    appLogger.error(`[authChecker] invalid role`);
  }
  return isValidRole;
}

function checkProfile(
  user: UserAuthenticated,
  ...exprectedProfiles: UserProfile[]
) {
  const userProfile = user._userProfile;
  const isValidRole =
    user &&
    (exprectedProfiles.includes(userProfile) ||
      // hack: pour le moment, l'admin domifa est aussi un user structure
      (userProfile === "super-admin-domifa" &&
        exprectedProfiles.includes("structure")));
  if (user && !isValidRole) {
    appLogger.warn(
      `[authChecker] invalid profile "${userProfile}" for user "${
        user._userId
      }" (expected: ${exprectedProfiles.join(",")})"`,
      {
        sentryBreadcrumb: true,
      }
    );
    appLogger.error(`[authChecker] invalid profile`);
  }
  return isValidRole;
}

export function isDomifaAdmin(
  user: Pick<UserStructure, "structureId" | "role">
) {
  return !!user && user.role === "admin" && user.structureId === 1;
}
