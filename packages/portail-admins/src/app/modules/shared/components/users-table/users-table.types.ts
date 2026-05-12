import { UserStatus, UserStructure } from "@domifa/common";

export type UsersTableRow = Pick<
  UserStructure,
  | "id"
  | "uuid"
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "structureId"
  | "lastLogin"
  | "passwordLastUpdate"
  | "createdAt"
> & {
  status: UserStatus;
  structureName?: string;
};

export const USER_STATUS_LABELS: { [key in UserStatus]: string } = {
  ACTIVE: "Actif",
  PENDING: "En attente",
  BLOCKED: "Bloqué",
  TEMPORARILY_BLOCKED: "Blocage temporaire",
};

export const USER_STATUS_BADGE_CLASS: { [key in UserStatus]: string } = {
  ACTIVE: "fr-badge--success",
  PENDING: "fr-badge--info",
  BLOCKED: "fr-badge--error",
  TEMPORARILY_BLOCKED: "fr-badge--warning",
};
