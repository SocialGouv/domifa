export const dataEmailAnonymizer = {
  isEmailToAnonymize,
  isAnonymizedEmail,
  anonymizeEmail,
};

export const ANONYMOUS_EMAIL_DOMAIN = "domifa-fake.fabrique.social.gouv.fr";

function isEmailToAnonymize(email: string): boolean {
  return (
    !!email &&
    email !== "" &&
    !email.includes("@yopmail.com") &&
    !email.includes("@fabrique.social.gouv.fr")
  );
}

function isAnonymizedEmail(email: string): boolean {
  return email && email.includes(`@${ANONYMOUS_EMAIL_DOMAIN}`);
}

function anonymizeEmail({
  prefix,
  id,
}: {
  prefix: string;
  id: string | number;
}) {
  return `${prefix}-${id}@${ANONYMOUS_EMAIL_DOMAIN}`;
}
