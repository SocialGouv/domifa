import {
  LOG_ACTION_LABELS,
  SECURITY_LOG_ACTIONS,
  SecurityLogAction,
} from "@domifa/common";

// Actions surfaced in the "Activité suspecte" filter — kept aligned with the
// backend `SUSPICIOUS_LOG_ACTIONS` whitelist (admin-security.service). Only
// the actions that reflect a real blocking/denial event are exposed; the rest
// of the SecurityLogAction union (LOGIN_OK, OTP_*, RESET_*…) lives in user
// fiches but would only add noise to the global suspicious view.
export const SUSPICIOUS_ACTIONS: SecurityLogAction[] = [
  "BLOCK_USER",
  "BLOCK_USER_BY_ADMIN",
  "THROTTLE_BLOCKED",
  "REQUEST_BLOCKED",
  "UNBLOCK_USER",
  "ACCESS_DENIED_NON_ACTIVE",
  "LOGIN_UNKNOWN_USER",
];

// Labels for the full SecurityLogAction union — needed when a row pre-dates
// the current SUSPICIOUS_ACTIONS whitelist and we still want to render its
// badge. Sourced from @domifa/common (LOG_ACTION_LABELS) so we don't
// maintain a parallel copy.
export const SUSPICIOUS_ACTION_LABELS: Record<SecurityLogAction, string> =
  SECURITY_LOG_ACTIONS.reduce((acc, action) => {
    acc[action] = LOG_ACTION_LABELS[action];
    return acc;
  }, {} as Record<SecurityLogAction, string>);

export type ActionTone = "error" | "warning" | "success" | "info" | "neutral";

// Severity tone per action. Only events that genuinely signal an attack
// (anti-bruteforce kicking in, a request rejected for suspicious shape)
// are flagged "error" — admin/auto blocks of an individual account, failed
// logins, password retries are normal friction and stay warning/neutral.
export const ACTION_TONE: Record<SecurityLogAction, ActionTone> = {
  THROTTLE_BLOCKED: "error",
  REQUEST_BLOCKED: "error",
  BLOCK_USER: "warning",
  BLOCK_USER_BY_ADMIN: "warning",
  UNBLOCK_USER: "success",
  ACCESS_DENIED_NON_ACTIVE: "neutral",
  UNBLOCK_BREVO_CONTACT: "info",
  LOGIN_OK: "info",
  LOGIN_SUCCESS: "success",
  LOGIN_ERROR: "neutral",
  LOGIN_UNKNOWN_USER: "warning",
  LOGOUT: "neutral",
  CHANGE_PASSWORD_SUCCESS: "success",
  CHANGE_PASSWORD_ERROR: "warning",
  RESET_PASSWORD_REQUEST: "info",
  RESET_PASSWORD_SUCCESS: "success",
  RESET_PASSWORD_ERROR: "warning",
  VALIDATE_ACCOUNT_SUCCESS: "success",
  VALIDATE_ACCOUNT_ERROR: "warning",
  OTP_REQUESTED: "info",
  OTP_SUCCESS: "success",
  OTP_ERROR: "warning",
};

// DSFR icon per action. DSFR's icon set is limited (no shield-flash, no
// login-box, no forbid) — only classes confirmed present in
// @gouvfr/dsfr/dist/utility/icons are used here.
export const ACTION_ICON: Record<SecurityLogAction, string> = {
  THROTTLE_BLOCKED: "fr-icon-alarm-warning-fill",
  REQUEST_BLOCKED: "fr-icon-error-fill",
  BLOCK_USER: "fr-icon-lock-fill",
  BLOCK_USER_BY_ADMIN: "fr-icon-lock-fill",
  UNBLOCK_USER: "fr-icon-lock-unlock-fill",
  ACCESS_DENIED_NON_ACTIVE: "fr-icon-lock-fill",
  UNBLOCK_BREVO_CONTACT: "fr-icon-mail-fill",
  LOGIN_OK: "fr-icon-account-circle-fill",
  LOGIN_SUCCESS: "fr-icon-account-circle-fill",
  LOGIN_ERROR: "fr-icon-error-warning-fill",
  LOGIN_UNKNOWN_USER: "fr-icon-user-search-fill",
  LOGOUT: "fr-icon-logout-box-r-fill",
  CHANGE_PASSWORD_SUCCESS: "fr-icon-lock-fill",
  CHANGE_PASSWORD_ERROR: "fr-icon-error-warning-fill",
  RESET_PASSWORD_REQUEST: "fr-icon-refresh-fill",
  RESET_PASSWORD_SUCCESS: "fr-icon-refresh-fill",
  RESET_PASSWORD_ERROR: "fr-icon-error-warning-fill",
  VALIDATE_ACCOUNT_SUCCESS: "fr-icon-checkbox-circle-fill",
  VALIDATE_ACCOUNT_ERROR: "fr-icon-error-warning-fill",
  OTP_REQUESTED: "fr-icon-mail-fill",
  OTP_SUCCESS: "fr-icon-mail-check-fill",
  OTP_ERROR: "fr-icon-mail-forbid-fill",
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
  // Legacy reason (no longer emitted): historically posed on the previous
  // session when a fresh login required OTP. Sequence on the timeline:
  // this row = "OTP envoyé", suivi du REPLACED suivant = "Nouvelle session
  // ouverte".
  OTP_REQUIRED: "Envoi d'OTP pour ouvrir une nouvelle session",
};

// Bucket the AppLogActorType values into the human kinds displayed in the
// "Type d'utilisateur" column. Supervisor labels are role-specific (Admin
// DomiFa / DGCS / DDETS / DREETS) — see `resolveUserKindLabel` below.
const USER_KIND_LABELS: Record<string, string> = {
  usager: "Domicilié (Mon DomiFa)",
  user_structure: "Structure (DomiFa)",
  user_supervisor: "Utilisateur",
  anonymous: "Anonyme",
};

// Supervisor role → official agency name. Kept frontend-side because this
// admin view is the only one that surfaces this naming; the rest of the
// codebase uses USER_SUPERVISOR_ROLES_LABELS (Région/Département/DGCS/…).
const USER_SUPERVISOR_AGENCY_LABELS: Record<string, string> = {
  "super-admin-domifa": "Admin DomiFa",
  national: "DGCS",
  department: "DDETS",
  region: "DREETS",
};

// Mirrors @domifa/common's USER_STRUCTURE_ROLES_LABELS — inlined to keep the
// label-resolution helper self-contained.
const USER_STRUCTURE_ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  responsable: "Gestionnaire",
  simple: "Instructeur",
  facteur: "Facteur",
  agent: "Agent d'accueil",
};

// Returns the cell content for the "Type d'utilisateur" column. The label
// always reflects the user type/portal — whether the row resolved to a real
// account or not is conveyed by the identity column, not by mutating this
// label.
export function resolveUserKindLabel(
  userType: string | undefined,
  role: string | undefined
): string {
  if (userType === "user_supervisor") {
    const agency = role ? USER_SUPERVISOR_AGENCY_LABELS[role] : undefined;
    return agency ?? USER_KIND_LABELS.user_supervisor;
  }
  if (userType === "user_structure" && role) {
    const roleLabel = USER_STRUCTURE_ROLE_LABELS[role] ?? role;
    return `${roleLabel} (DomiFa)`;
  }
  return USER_KIND_LABELS[userType ?? ""] ?? "—";
}
