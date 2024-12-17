import { appLogger } from "../../util";
import {
  UserAuthenticated,
  UserProfile,
  UserStructure,
} from "../../_common/model";
import { DOMIFA_ADMIN_STRUCTURE_ID } from "./DOMIFA_ADMIN_STRUCTURE_ID.const";
import { UserStructureRole } from "@domifa/common";

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

export function isDomifaAdmin(
  user: Pick<UserStructure, "structureId" | "role">
) {
  return (
    !!user &&
    user.role === "admin" &&
    user.structureId === DOMIFA_ADMIN_STRUCTURE_ID
  );
}
