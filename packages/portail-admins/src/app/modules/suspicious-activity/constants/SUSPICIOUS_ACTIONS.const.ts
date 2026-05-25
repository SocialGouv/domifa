import { SuspiciousLogAction } from "../types/suspicious-activity-log";

export const SUSPICIOUS_ACTIONS: SuspiciousLogAction[] = [
  "BLOCK_USER",
  "BLOCK_USER_BY_ADMIN",
  "THROTTLE_BLOCKED",
  "REQUEST_BLOCKED",
  "UNBLOCK_USER",
  "ACCESS_DENIED_NON_ACTIVE",
];

// Inlined to avoid pulling @domifa/common's CJS bundle into this lazy chunk —
// esbuild's named-import interop is unreliable there. Keep in sync with
// LOG_ACTION_LABELS in @domifa/common if the wording is updated.
export const SUSPICIOUS_ACTION_LABELS: Record<SuspiciousLogAction, string> = {
  BLOCK_USER: "Blocage automatique d'un utilisateur",
  BLOCK_USER_BY_ADMIN: "Blocage manuel d'un utilisateur",
  THROTTLE_BLOCKED: "Quota de requêtes dépassé",
  REQUEST_BLOCKED: "Requête bloquée",
  UNBLOCK_USER: "Déblocage d'un utilisateur",
  ACCESS_DENIED_NON_ACTIVE: "Accès refusé (compte non actif)",
};

// DSFR badge severity per action.
export const ACTION_BADGE_CLASS: Record<SuspiciousLogAction, string> = {
  BLOCK_USER: "fr-badge--error",
  BLOCK_USER_BY_ADMIN: "fr-badge--error",
  THROTTLE_BLOCKED: "fr-badge--warning",
  REQUEST_BLOCKED: "fr-badge--warning",
  ACCESS_DENIED_NON_ACTIVE: "fr-badge--warning",
  UNBLOCK_USER: "fr-badge--success",
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
