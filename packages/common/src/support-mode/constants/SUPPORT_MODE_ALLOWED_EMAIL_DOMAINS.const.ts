// Only admins whose email belongs to one of these domains may attach the
// support account to a structure (checked by the backend and the admin portal).
export const SUPPORT_MODE_ALLOWED_EMAIL_DOMAINS = [
  "@fabrique.social.gouv.fr",
  "@externes.sg.social.gouv.fr",
];

export const isSupportModeAllowedEmail = (
  email: string | null | undefined
): boolean => {
  const normalized = email?.trim().toLowerCase() ?? "";
  return SUPPORT_MODE_ALLOWED_EMAIL_DOMAINS.some((domain) =>
    normalized.endsWith(domain)
  );
};
