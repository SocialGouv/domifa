import { LogAction } from "./LogAction.type";

// Subset of LogAction stored in the dedicated `app_log_security` table. Every
// action listed here is a signal used to study suspicious behavior (auto-block,
// throttle, manual block/unblock by admin, access denied on inactive accounts).
// `Extract` keeps the union in sync with LogAction — removing an action from
// LogAction will fail the build here until it's removed from this list too.
export type SecurityLogAction = Extract<
  LogAction,
  | "THROTTLE_BLOCKED"
  | "REQUEST_BLOCKED"
  | "BLOCK_USER"
  | "BLOCK_USER_BY_ADMIN"
  | "UNBLOCK_USER"
  | "ACCESS_DENIED_NON_ACTIVE"
  | "UNBLOCK_BREVO_CONTACT"
>;

export const SECURITY_LOG_ACTIONS: readonly SecurityLogAction[] = [
  "THROTTLE_BLOCKED",
  "REQUEST_BLOCKED",
  "BLOCK_USER",
  "BLOCK_USER_BY_ADMIN",
  "UNBLOCK_USER",
  "ACCESS_DENIED_NON_ACTIVE",
  "UNBLOCK_BREVO_CONTACT",
] as const;
