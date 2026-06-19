import { UserStatus } from "../types/UserStatus.type";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Actif",
  PENDING: "En attente d'activation",
  TEMPORARILY_BLOCKED: "Temporairement bloqué",
  BLOCKED: "Bloqué",
  DELETE: "Supprimé",
};
