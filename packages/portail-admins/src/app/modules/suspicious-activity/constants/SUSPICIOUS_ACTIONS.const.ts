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

// Bucket the AppLogActorType values into the human kinds displayed in the
// "Type d'utilisateur" column. Supervisor labels are role-specific (Admin
// DomiFa / DGCS / DDETS / DREETS) — see `resolveUserKindLabel` below.
const USER_KIND_LABELS: Record<string, string> = {
  usager: "Domicilié",
  user_structure: "Utilisateur",
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

// Returns the cell content for the "Type d'utilisateur" column. Falls back to
// the bucket label when we don't have a role-specific override.
export function resolveUserKindLabel(
  userType: string | undefined,
  role: string | undefined
): string {
  if (userType === "user_supervisor") {
    const agency = role ? USER_SUPERVISOR_AGENCY_LABELS[role] : undefined;
    return agency ?? USER_KIND_LABELS.user_supervisor;
  }
  const kind = USER_KIND_LABELS[userType ?? ""];
  if (!kind) {
    return "—";
  }
  if (userType === "user_structure" && role) {
    const roleLabel = USER_STRUCTURE_ROLE_LABELS[role] ?? role;
    return `${kind} (${roleLabel})`;
  }
  return kind;
}
