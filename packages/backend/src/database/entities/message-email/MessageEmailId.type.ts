export type MessageEmailTipimailTemplateId =
  | "user-account-created-by-admin"
  | "user-account-activation-pending"
  | "user-account-activated";

export type MessageContentEmailId =
  | "user-reset-password"
  | "usager-appointment-created"
  | "admin-batchs-error-report"
  | "import-guide"
  | "new-structure"
  | "delete-structure"
  | "hard-reset"
  | "user-guide";

export type MessageEmailId =
  | MessageEmailTipimailTemplateId
  | MessageContentEmailId;

export const TIPIMAIL_TEMPLATES_MESSAGE_IDS: MessageEmailTipimailTemplateId[] = [
  "user-account-created-by-admin",
  "user-account-activation-pending",
  "user-account-activated",
];
