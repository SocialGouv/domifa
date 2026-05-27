import {
  LOG_ACTION_LABELS,
  SECURITY_LOG_ACTIONS,
  SecurityLogAction,
} from "@domifa/common";

// Full set of security actions surfaced by the "Activité suspecte" view.
// Sourced from @domifa/common so the enum stays in sync with the backend
// SecurityLogAction union.
export const SUSPICIOUS_ACTIONS: SecurityLogAction[] = [
  ...SECURITY_LOG_ACTIONS,
];

// French labels for the suspicious-activity view. Re-exported from
// @domifa/common so we don't maintain a parallel copy.
export const SUSPICIOUS_ACTION_LABELS: Record<SecurityLogAction, string> =
  SUSPICIOUS_ACTIONS.reduce((acc, action) => {
    acc[action] = LOG_ACTION_LABELS[action];
    return acc;
  }, {} as Record<SecurityLogAction, string>);

// DSFR badge severity per action. UI-only concern, kept frontend-side.
export const ACTION_BADGE_CLASS: Record<SecurityLogAction, string> = {
  THROTTLE_BLOCKED: "fr-badge--warning",
  REQUEST_BLOCKED: "fr-badge--warning",
  BLOCK_USER: "fr-badge--error",
  BLOCK_USER_BY_ADMIN: "fr-badge--error",
  UNBLOCK_USER: "fr-badge--success",
  ACCESS_DENIED_NON_ACTIVE: "fr-badge--warning",
  UNBLOCK_BREVO_CONTACT: "fr-badge--info",
  LOGIN_OK: "fr-badge--info",
  LOGIN_SUCCESS: "fr-badge--success",
  LOGIN_ERROR: "fr-badge--warning",
  LOGOUT: "fr-badge--info",
  CHANGE_PASSWORD_SUCCESS: "fr-badge--success",
  CHANGE_PASSWORD_ERROR: "fr-badge--warning",
  RESET_PASSWORD_REQUEST: "fr-badge--info",
  RESET_PASSWORD_SUCCESS: "fr-badge--success",
  RESET_PASSWORD_ERROR: "fr-badge--warning",
  VALIDATE_ACCOUNT_SUCCESS: "fr-badge--success",
  VALIDATE_ACCOUNT_ERROR: "fr-badge--warning",
  OTP_REQUESTED: "fr-badge--info",
  OTP_SUCCESS: "fr-badge--success",
  OTP_ERROR: "fr-badge--warning",
};

// French labels for session-closure reasons (kept here so the suspicious view
// owns its own copy — UserSessionRecord lives in backend-only model).
export const SESSION_CLOSED_REASON_LABELS: Record<string, string> = {
  EXPIRED: "Expirée",
  REPLACED: "Remplacée par une nouvelle session",
  IP_MISMATCH: "Adresse IP différente",
  UA_MISMATCH: "Navigateur différent",
  MANUAL_LOGOUT: "Déconnexion manuelle",
  ADMIN_REVOKED: "Révoquée par un administrateur",
  OTP_REQUIRED: "OTP requis (session abandonnée)",
};
