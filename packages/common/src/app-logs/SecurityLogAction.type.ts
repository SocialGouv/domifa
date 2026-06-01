import { LogAction } from "./LogAction.type";

// Subset of LogAction stored in the dedicated `app_log_security` table. Covers
// the full account lifecycle (login attempts, password changes, resets, OTP,
// admin blocks/unblocks, automated throttle/request blocks). `Extract` keeps
// the union in sync with LogAction — removing an action from LogAction will
// fail the build here until it's removed from this list too.
export type SecurityLogAction = Extract<
  LogAction,
  | "THROTTLE_BLOCKED"
  | "REQUEST_BLOCKED"
  | "BLOCK_USER"
  | "BLOCK_USER_BY_ADMIN"
  | "UNBLOCK_USER"
  | "ACCESS_DENIED_NON_ACTIVE"
  | "UNBLOCK_BREVO_CONTACT"
  | "LOGIN_OK"
  | "LOGIN_SUCCESS"
  | "LOGIN_ERROR"
  | "LOGIN_UNKNOWN_USER"
  | "LOGOUT"
  | "CHANGE_PASSWORD_SUCCESS"
  | "CHANGE_PASSWORD_ERROR"
  | "RESET_PASSWORD_REQUEST"
  | "RESET_PASSWORD_SUCCESS"
  | "RESET_PASSWORD_ERROR"
  | "VALIDATE_ACCOUNT_SUCCESS"
  | "VALIDATE_ACCOUNT_ERROR"
  | "OTP_REQUESTED"
  | "OTP_SUCCESS"
  | "OTP_ERROR"
>;

export const SECURITY_LOG_ACTIONS: readonly SecurityLogAction[] = [
  "THROTTLE_BLOCKED",
  "REQUEST_BLOCKED",
  "BLOCK_USER",
  "BLOCK_USER_BY_ADMIN",
  "UNBLOCK_USER",
  "ACCESS_DENIED_NON_ACTIVE",
  "UNBLOCK_BREVO_CONTACT",
  "LOGIN_OK",
  "LOGIN_SUCCESS",
  "LOGIN_ERROR",
  "LOGIN_UNKNOWN_USER",
  "LOGOUT",
  "CHANGE_PASSWORD_SUCCESS",
  "CHANGE_PASSWORD_ERROR",
  "RESET_PASSWORD_REQUEST",
  "RESET_PASSWORD_SUCCESS",
  "RESET_PASSWORD_ERROR",
  "VALIDATE_ACCOUNT_SUCCESS",
  "VALIDATE_ACCOUNT_ERROR",
  "OTP_REQUESTED",
  "OTP_SUCCESS",
  "OTP_ERROR",
] as const;

// Subset that counts as a failed authentication attempt for the lockout
// backoff (3 in the last hour → 1h temporary block). RESET_PASSWORD_SUCCESS
// acts as a lower bound that resets these counters.
export const FAILED_AUTH_ACTIONS: readonly SecurityLogAction[] = [
  "LOGIN_ERROR",
  "CHANGE_PASSWORD_ERROR",
  "RESET_PASSWORD_ERROR",
  "VALIDATE_ACCOUNT_ERROR",
] as const;
