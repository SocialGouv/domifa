// "support" is deliberately excluded from ALL_USER_STRUCTURE_ROLES — it's a
// role for the single dedicated support account (see support-session
// module), not one of the standard roles a structure assigns its own team.
// Routes must opt in to it explicitly via @AllowUserStructureRoles("support").
export type UserStructureRole =
  | "simple"
  | "admin"
  | "facteur"
  | "responsable"
  | "agent"
  | "support";
