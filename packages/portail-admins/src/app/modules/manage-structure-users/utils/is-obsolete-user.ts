import { differenceInMonths } from "date-fns";

export const OBSOLETE_REGISTRATION_MONTHS = 12;
export const OBSOLETE_LAST_LOGIN_MONTHS = 12;

// "Obsolète" = compte créé il y a plus d'un an ET (jamais connecté OU
// dernière connexion il y a plus de 12 mois). Sert à cibler les comptes
// dormants candidats à la suppression depuis le portail-admin.
export function isObsoleteUser(user: {
  createdAt?: Date | string | null;
  lastLogin?: Date | string | null;
}): boolean {
  if (!user.createdAt) {
    return false;
  }
  const now = new Date();
  const createdAt = new Date(user.createdAt);
  if (differenceInMonths(now, createdAt) < OBSOLETE_REGISTRATION_MONTHS) {
    return false;
  }
  if (!user.lastLogin) {
    return true;
  }
  const lastLogin = new Date(user.lastLogin);
  return differenceInMonths(now, lastLogin) >= OBSOLETE_LAST_LOGIN_MONTHS;
}
