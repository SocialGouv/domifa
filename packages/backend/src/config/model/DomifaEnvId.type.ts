export type DomifaEnvId =
  | "prod"
  | "preprod"
  | "local"
  | "dev"
  | "test"
  | "backend-cron";

export const DOMIFA_ENV_IDS: DomifaEnvId[] = [
  "prod",
  "backend-cron",
  "preprod",
  "local",
  "dev",
  "test",
];
