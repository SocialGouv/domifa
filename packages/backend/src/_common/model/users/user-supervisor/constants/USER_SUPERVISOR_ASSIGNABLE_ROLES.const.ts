import { UserSupervisorRole } from "@domifa/common";
import { USER_SUPERVISOR_ROLES } from "./USER_SUPERVISOR_ROLES.const";

// Roles reachable by editing an existing supervisor. `super-admin-domifa` is
// only granted at creation, where the email domain is checked.
export const USER_SUPERVISOR_ASSIGNABLE_ROLES: UserSupervisorRole[] =
  USER_SUPERVISOR_ROLES.filter((r) => r !== "super-admin-domifa");
