import {
  UserStatus,
  UserStructure,
  UserStructureEmailStatus,
} from "@domifa/common";

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
  emailStatus?: UserStructureEmailStatus | null;
  structureName?: string;
  structureUuid?: string;
};

export const USER_STATUS_LABELS: { [key in UserStatus]: string } = {
  ACTIVE: "Actif",
  PENDING: "En attente",
  BLOCKED: "Bloqué",
  TEMPORARILY_BLOCKED: "Blocage temporaire",
  DELETE: "Supprimé",
};

export const USER_STATUS_BADGE_CLASS: { [key in UserStatus]: string } = {
  ACTIVE: "fr-badge--success",
  PENDING: "fr-badge--info",
  BLOCKED: "fr-badge--error",
  TEMPORARILY_BLOCKED: "fr-badge--warning",
  DELETE: "fr-badge--error",
};

export const USER_STRUCTURE_EMAIL_STATUS_BADGE_CLASS: {
  [key in UserStructureEmailStatus]: string;
} = {
  PERSONAL: "fr-badge--success",
  GENERIC_SUSPECTED: "fr-badge--warning",
  GENERIC_CONFIRMED: "fr-badge--error",
};
