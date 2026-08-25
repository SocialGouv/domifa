import { OtpPurpose } from "@domifa/common";

// Brevo template param `motif` for the OTP confirmation email: shows the user
// in plain French what they are about to confirm. Not emitted for LOGIN, and
// not emitted for the legacy "EXPORT" purpose (replaced by EXPORT_* variants).
export const OTP_ACTION_MOTIF_LABELS: Record<
  Exclude<OtpPurpose, "LOGIN" | "EXPORT">,
  string
> = {
  EXPORT_STRUCTURE_USAGERS: "Export des usagers de la structure",
  EXPORT_PORTAIL_USAGERS_ACCOUNTS:
    "Export des comptes du portail bénéficiaires",
  EXPORT_ADMIN_STATS_DEPLOIEMENT:
    "Export des statistiques de déploiement DomiFa",
  RESET_USAGERS: "Réinitialisation des usagers",
  DOWNLOAD_MULTIPLE_DOCS: "Téléchargement de documents",
  DELETE_STRUCTURE: "Suppression de la structure",
  UNBLOCK_USER: "Déblocage d'un utilisateur",
  BLOCK_USER_BY_ADMIN: "Blocage d'un utilisateur",
  DELETE_USER_BY_ADMIN: "Suppression d'un utilisateur",
  UNBLOCK_BREVO_CONTACT:
    "Déblocage du contact Brevo (blocklist transactionnelle)",
  USER_EMAIL_SELF_UPDATE_REQUESTED:
    "Modification de l'adresse email par l'utilisateur",
};
