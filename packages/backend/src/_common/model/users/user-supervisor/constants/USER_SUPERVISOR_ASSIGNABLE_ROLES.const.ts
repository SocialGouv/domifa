import { UserSupervisorRole } from "@domifa/common";
import { USER_SUPERVISOR_ROLES } from "./USER_SUPERVISOR_ROLES.const";

// `super-admin-domifa` is assigned out-of-band (SQL migration), never via UI.
export const USER_SUPERVISOR_ASSIGNABLE_ROLES: UserSupervisorRole[] =
  USER_SUPERVISOR_ROLES.filter((r) => r !== "super-admin-domifa");
