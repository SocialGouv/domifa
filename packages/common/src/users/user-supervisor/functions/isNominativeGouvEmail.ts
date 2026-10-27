// DDETS and DREETS agents must be invited with their nominative .gouv.fr
// address, e.g. prenom.nom@seine-saint-denis.gouv.fr or prenom.nom@dreets.gouv.fr
export const NOMINATIVE_GOUV_EMAIL_REGEX =
  /^[a-z0-9_-]+(\.[a-z0-9_-]+)+@[a-z0-9-]+\.gouv\.fr$/i;

export const isNominativeGouvEmail = (
  email: string | null | undefined
): boolean =>
  typeof email === "string" && NOMINATIVE_GOUV_EMAIL_REGEX.test(email.trim());
