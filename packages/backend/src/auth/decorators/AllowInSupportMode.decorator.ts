import { SetMetadata } from "@nestjs/common";

// Opt-in escape hatch for AppUserGuard's support-mode write block: marks a
// non-GET route as safe to reach while impersonating a structure in
// read-only support mode (e.g. a POST-based search/filter endpoint that
// doesn't mutate anything).
export const AllowInSupportMode = () => SetMetadata("allowInSupportMode", true);
