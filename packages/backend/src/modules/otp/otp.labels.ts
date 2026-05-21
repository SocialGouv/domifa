import { OtpPurpose } from "./otp.types";

// Brevo template param `motif` for the OTP confirmation email: shows the user
// in plain French what they are about to confirm. Not used for LOGIN.
export const OTP_ACTION_MOTIF_LABELS: Record<
  Exclude<OtpPurpose, "LOGIN">,
  string
> = {
  EXPORT: "Export des usagers",
  RESET_USAGERS: "Réinitialisation des usagers",
  DOWNLOAD_MULTIPLE_DOCS: "Téléchargement de documents",
  DELETE_STRUCTURE: "Suppression de la structure",
  UNBLOCK_USER: "Déblocage d'un utilisateur",
  BLOCK_USER_BY_ADMIN: "Blocage d'un utilisateur",
  DELETE_USER_BY_ADMIN: "Suppression d'un utilisateur",
};
