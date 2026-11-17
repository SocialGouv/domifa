// Length rules of the contact forms, shared by the frontends and the backend
// DTOs so that both sides always validate the same way
export const CONTACT_FORM_RULES = {
  emailMaxLength: 254,
  structureNameMinLength: 2,
  structureNameMaxLength: 300,
} as const;

export const MON_DOMIFA_CONTACT_RULES = {
  ...CONTACT_FORM_RULES,
  nameMaxLength: 200,
  contentMinLength: 10,
  contentMaxLength: 5000,
} as const;
