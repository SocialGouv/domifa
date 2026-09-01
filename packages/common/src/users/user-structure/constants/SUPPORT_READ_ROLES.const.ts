import { UserStructureRole } from "../types";
import { ALL_USER_STRUCTURE_ROLES } from "./ALL_USER_STRUCTURE_ROLES.const";

// Every standard structure role, plus the dedicated "support" account —
// for read-only routes that a support attachment must be able to reach.
// Never spread onto a write route: "support" must stay excluded there.
export const SUPPORT_READ_ROLES: UserStructureRole[] = [
  ...ALL_USER_STRUCTURE_ROLES,
  "support",
];
