export const PASSWORD_CHANGE_WARNING_MONTHS = 24;
export const PASSWORD_CHANGE_EXPIRED_MONTHS = 36;

// Number of past password hashes kept per account to reject reuse.
export const PASSWORD_HISTORY_SIZE = 5;

// Messages shown to the user for the rejection reasons the edit-my-password
// endpoint can return, keyed by the error `message` sent back by the API.
export const PASSWORD_CHANGE_ERROR_MESSAGES: Record<string, string> = {
  NEW_PASSWORD_SAME_AS_OLD:
    "Le nouveau mot de passe doit être différent de l'ancien mot de passe",
  NEW_PASSWORD_ALREADY_USED:
    "Ce mot de passe a déjà été utilisé récemment, merci d'en choisir un autre",
};
