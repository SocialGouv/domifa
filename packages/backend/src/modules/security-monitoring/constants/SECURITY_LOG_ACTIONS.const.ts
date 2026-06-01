import {
  EmailAlertingLogAction,
  SuspiciousLogAction,
} from "../types/security-alert.types";

// Single source of truth for the actions surfaced in the super-admin
// "Suspicious activity" view.
export const SUSPICIOUS_LOG_ACTIONS: SuspiciousLogAction[] = [
  "BLOCK_USER",
  "BLOCK_USER_BY_ADMIN",
  "THROTTLE_BLOCKED",
  "REQUEST_BLOCKED",
  "UNBLOCK_USER",
  "ACCESS_DENIED_NON_ACTIVE",
  "LOGIN_UNKNOWN_USER",
];

// Subset that the 5-min CRON aggregates into alert emails. UNBLOCK_USER and
// ACCESS_DENIED_NON_ACTIVE are intentionally excluded — useful in the UI but
// would inflate the mail noise.
export const EMAIL_ALERTING_LOG_ACTIONS: EmailAlertingLogAction[] = [
  "BLOCK_USER",
  "REQUEST_BLOCKED",
  "THROTTLE_BLOCKED",
];
