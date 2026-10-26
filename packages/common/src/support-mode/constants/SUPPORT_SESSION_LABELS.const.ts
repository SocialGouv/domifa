import { SupportSessionRevokedReason } from "../types/SupportSessionRevokedReason.type";
import { SupportSessionStatus } from "../types/SupportSessionStatus.type";

export const SUPPORT_SESSION_STATUS_LABELS: Record<
  SupportSessionStatus,
  string
> = {
  ACTIVE: "Active",
  EXPIRED: "Expirée",
  REVOKED: "Révoquée",
};

// How the attachment ended ("moyen de déconnexion").
export const SUPPORT_SESSION_REVOKED_REASON_LABELS: Record<
  SupportSessionRevokedReason,
  string
> = {
  MANUAL_REVOKE: "Révoquée manuellement",
  EXPIRED: "Expirée",
  REPLACED: "Remplacée par une nouvelle session",
  STRUCTURE_LOGOUT: "Déconnexion de la structure",
};
