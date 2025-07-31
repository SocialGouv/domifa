import { UserSecurityEventType } from "../../shared/types/UserSecurityEvent.type";

export const UserStructureEventHistoryLabels: {
  [key in UserSecurityEventType]: string;
} = {
  "login-success": "Connexion réussie",
  "login-error": "Tentative de connexion échouée",
  "change-password-success": "Changement de mot de passe réussi",
  "change-password-error": "Tentative de changement de mot de passe échouée",
  "reset-password-request": "Demande de réinitialisation de mot de passe",
  "reset-password-success": "Réinitialisation de mot de passe réussie",
  "reset-password-error":
    "Tentative de réinitialisation de mot de passe échouée",
  "validate-account-error": "Problème de validiation de compte", // not used
  "validate-account-success": "Validiation compte réussie", // not used
};
