export type MessageEmailTipimailTemplateId =
  | "structure-delete"
  | "user-account-created-by-admin"
  | "user-account-activation-pending"
  | "user-account-activated"
  | "structure-hard-reset";

export type MessageContentEmailId =
  | "user-reset-password"
  | "usager-appointment-created"
  | "admin-batchs-error-report"
  | "import-guide"
  | "new-structure"
  | "user-guide";

export type MessageEmailId =
  | MessageEmailTipimailTemplateId
  | MessageContentEmailId;

export const TIPIMAIL_TEMPLATES_MESSAGE_IDS: MessageEmailTipimailTemplateId[] = [
  "structure-delete",
  "user-account-created-by-admin",
  "user-account-activation-pending",
  "user-account-activated",
  "structure-hard-reset",
];
