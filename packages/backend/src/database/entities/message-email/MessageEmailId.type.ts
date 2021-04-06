export type MessageContentEmailId =
  | "user-reset-password"
  | "usager-appointment-created"
  | "admin-batchs-error-report"
  | "import-guide"
  | "new-structure"
  | "delete-structure"
  | "hard-reset"
  | "user-guide"
  | "user-account-activated"
  | "user-account-created-by-admin";

export type MessageEmailId = MessageContentEmailId;
