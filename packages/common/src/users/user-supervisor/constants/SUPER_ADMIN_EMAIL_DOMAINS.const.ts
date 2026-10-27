// Only these email domains may hold the `super-admin-domifa` role.
export const SUPER_ADMIN_EMAIL_DOMAINS = [
  "fabrique.social.gouv.fr",
  "externes.sg.social.gouv.fr",
  "social.gouv.fr",
];

export const isSuperAdminEmailDomain = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();
  return SUPER_ADMIN_EMAIL_DOMAINS.some((domain) =>
    lowerEmail.endsWith(`@${domain}`)
  );
};
