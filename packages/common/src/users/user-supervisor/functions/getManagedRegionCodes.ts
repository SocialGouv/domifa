import { REGIONS_DEF } from "../../../territoires";
import { REGION_USERS_MANAGER_ROLES } from "../constants/REGION_MANAGED_ROLES.const";
import { UserSupervisorRole } from "../types";

export const isRegionUsersManager = (
  role: UserSupervisorRole | null | undefined
): boolean =>
  !!role && (REGION_USERS_MANAGER_ROLES as readonly string[]).includes(role);

// Regions whose DREETS / DDETS accounts the user may manage: its own regions
// for a DREETS, all of them for the DGCS, none otherwise
export const getManagedRegionCodes = (user: {
  role: UserSupervisorRole;
  territories?: string[] | null;
}): string[] => {
  if (user.role === "national") {
    return REGIONS_DEF.map((region) => region.regionCode);
  }
  if (user.role === "region") {
    return user.territories ?? [];
  }
  return [];
};
