// DDETS agents must be invited with their nominative departmental address,
// e.g. prenom.nom@seine-saint-denis.gouv.fr
export const DDETS_EMAIL_REGEX =
  /^[a-z0-9_-]+(\.[a-z0-9_-]+)+@[a-z0-9-]+\.gouv\.fr$/i;

export const isDdetsEmail = (email: string | null | undefined): boolean =>
  typeof email === "string" && DDETS_EMAIL_REGEX.test(email.trim());
