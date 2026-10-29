// Roles a DREETS may hand out from the pilotage portal: never national nor
// super-admin
export const REGION_MANAGED_ROLES = ["department", "region"] as const;

export type RegionManagedRole = (typeof REGION_MANAGED_ROLES)[number];
