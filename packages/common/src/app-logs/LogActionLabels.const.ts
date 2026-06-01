import { LogAction } from "./LogAction.type";

// Typed on the LogAction union so any new action must be labelled here.
export const LOG_ACTION_LABELS: Record<LogAction, string> = {
  REACTIVATION_ACCOUNT: "Compte réactivé",
  REACTIVATION_STRUCTURE: "Structure réactivée",
  BREVO_SYNC: "Synchronisation des contacts mailing",
  STRUCTURE_UPDATE: "Modification des informations de la structure",
  USAGERS_DELETE: "Suppression d'usagers",
  USAGERS_PHONE_UPDATE: "Modification du téléphone d'un usager",
  USAGERS_PHONE_DELETE: "Suppression du téléphone d'un usager",
  USAGERS_EMAIL_UPDATE: "Modification de l'email d'un usager",
  USAGERS_EMAIL_DELETE: "Suppression de l'email d'un usager",
  USAGERS_DOCS_UPLOAD: "Ajout d'un document à un usager",
  USAGERS_DOCS_DOWNLOAD: "Téléchargement d'un document d'usager",
  USAGERS_DOCS_DELETE: "Suppression d'un document d'usager",
  USAGERS_DOCS_RENAME: "Renommage d'un document d'usager",
  USAGERS_DOCS_SHARED: "Partage d'un document d'usager",
  USAGERS_PATCH_SMS_PHONE_NUMBER: "Modification du téléphone (SMS) d'un usager",
  USAGERS_PATCH_EMAIL: "Modification de l'email d'un usager",
  USAGERS_ENABLE_SMS: "Activation des SMS pour un usager",
  USAGERS_DISABLE_SMS: "Désactivation des SMS pour un usager",
  MON_DOMIFA_DOWNLOAD_DOC: "Téléchargement d'un document depuis Mon DomiFa",
  MON_DOMIFA_DOWNLOAD_DOC_TRY: "Tentative de téléchargement depuis Mon DomiFa",
  MON_DOMIFA_CREATE_PORTAIL_ACCOUNT_BULK:
    "Création groupée de comptes Mon DomiFa",
  EXPORT_USAGERS: "Export de la liste des usagers",
  GET_STATS: "Consultation des statistiques",
  EXPORT_STATS: "Export des statistiques",
  EXPORT_STATS_FROM_ADMIN: "Export des statistiques (vue administrateur)",
  ENABLE_SMS_BY_STRUCTURE: "Activation des SMS pour la structure",
  DISABLE_SMS_BY_STRUCTURE: "Désactivation des SMS pour la structure",
  SMS_SETTINGS_UPDATE: "Modification des paramètres SMS",
  EXPORT_DOMIFA: "Export des données DomiFa",
  GET_STATS_PORTAIL_ADMIN:
    "Consultation des statistiques (portail de pilotage)",
  GET_STATS_PORTAIL_ADMIN_DENIED: "Consultation des statistiques refusée",
  EXPORT_STATS_PORTAIL_ADMIN: "Export des statistiques (portail de pilotage)",
  IMPORT_USAGERS_SUCCESS: "Import d'usagers réussi",
  IMPORT_USAGERS_PREVIEW: "Aperçu avant import d'usagers",
  IMPORT_USAGERS_FAILED: "Import d'usagers en échec",
  IMPORT_TEMPLATE_DOWNLOAD: "Téléchargement du modèle d'import",
  IMPORT_DOWNLOAD_GUIDE: "Téléchargement du guide d'import",
  USER_ROLE_CHANGE: "Changement de rôle d'un utilisateur",
  USER_CREATE: "Création d'un utilisateur",
  USER_DELETE: "Suppression d'un utilisateur",
  ADMIN_CREATE_USER_STRUCTURE: "Création d'un utilisateur de structure",
  ADMIN_CREATE_USER_SUPERVISOR:
    "Création d'un utilisateur du portail de pilotage",
  ADMIN_PATCH_USER_SUPERVISOR:
    "Modification d'un utilisateur du portail de pilotage",
  ADMIN_DELETE_USER_SUPERVISOR:
    "Suppression d'un utilisateur du portail de pilotage",
  ADMIN_ELEVATE_ROLE_USER_SUPERVISOR: "Promotion en administrateur",
  ADMIN_USER_ROLE_CHANGE: "Changement de rôle d'un utilisateur",
  ADMIN_USER_CREATE: "Création d'un utilisateur",
  ADMIN_USER_DELETE: "Suppression d'un utilisateur",
  ADMIN_PASSWORD_RESET:
    "Envoi d'un mail de réinitialisation par un administrateur",
  ADMIN_STRUCTURE_VALIDATE: "Validation d'une structure",
  ADMIN_STRUCTURE_DELETE: "Suppression d'une structure",
  ADMIN_STRUCTURE_REFUSAL: "Refus d'une structure",
  ADMIN_STRUCTURE_CREATION: "Création d'une structure",
  SUPPRIMER_PIECE_JOINTE: "Suppression d'une pièce jointe",
  RESET_PASSWORD_PORTAIL:
    "Réinitialisation du mot de passe (portail des usagers)",
  DOWNLOAD_PASSWORD_PORTAIL: "Téléchargement d'un mot de passe usager",
  DELETE_NOTE: "Suppression d'une note",
  ENABLE_PORTAIL_BY_STRUCTURE:
    "Activation du portail des usagers pour la structure",
  DISABLE_PORTAIL_BY_STRUCTURE:
    "Désactivation du portail des usagers pour la structure",
  THROTTLE_BLOCKED:
    "Blocage automatique : trop de requêtes envoyées en peu de temps",
  REQUEST_BLOCKED: "Requête bloquée : comportement suspect détecté",
  UNBLOCK_USER: "Compte débloqué",
  BLOCK_USER:
    "Compte temporairement bloqué après trop de tentatives infructueuses",
  BLOCK_USER_BY_ADMIN: "Compte bloqué manuellement par un administrateur",
  ACCESS_DENIED_NON_ACTIVE: "Connexion refusée : le compte n'est pas actif",
  UNBLOCK_BREVO_CONTACT: "Adresse mail réautorisée chez le prestataire d'envoi",
  LOGIN_OK:
    "Mot de passe correct : en attente du code de vérification reçu par mail",
  LOGIN_SUCCESS: "Connexion réussie",
  LOGIN_ERROR: "Tentative de connexion échouée",
  LOGIN_UNKNOWN_USER: "Tentative de connexion sur un compte inconnu",
  LOGOUT: "Déconnexion",
  CHANGE_PASSWORD_SUCCESS: "Mot de passe modifié",
  CHANGE_PASSWORD_ERROR: "Tentative de modification du mot de passe échouée",
  RESET_PASSWORD_REQUEST: "Demande de réinitialisation du mot de passe",
  RESET_PASSWORD_SUCCESS: "Mot de passe réinitialisé",
  RESET_PASSWORD_ERROR: "Tentative de réinitialisation du mot de passe échouée",
  VALIDATE_ACCOUNT_SUCCESS: "Compte activé",
  VALIDATE_ACCOUNT_ERROR: "Tentative d'activation du compte échouée",
  OTP_REQUESTED: "Code de vérification envoyé par mail",
  OTP_SUCCESS: "Code de vérification correct",
  OTP_ERROR: "Code de vérification incorrect",
};

export function getLogActionLabel(action: string): string {
  return LOG_ACTION_LABELS[action as LogAction] ?? action;
}
