// Roles a DREETS or the DGCS may hand out from the pilotage portal: never
// national nor super-admin
export const REGION_MANAGED_ROLES = ["department", "region"] as const;

export type RegionManagedRole = (typeof REGION_MANAGED_ROLES)[number];

// Roles allowed to manage those accounts: a DREETS within its region(s), the
// DGCS (role "national") everywhere
export const REGION_USERS_MANAGER_ROLES = ["region", "national"] as const;
