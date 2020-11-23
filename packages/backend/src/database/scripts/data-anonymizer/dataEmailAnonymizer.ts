export const dataEmailAnonymizer = {
  isEmailToAnonymize,
  anonymizeEmail,
};

function isEmailToAnonymize(email: string): boolean {
  return (
    !!email &&
    email !== "" &&
    !email.includes("@yopmail.com") &&
    !email.includes("@fabrique.social.gouv.fr")
  );
}

function anonymizeEmail({
  prefix,
  id,
}: {
  prefix: string;
  id: string | number;
}) {
  return `${prefix}-${id}@domifa-fake.fabrique.social.gouv.fr`;
}
