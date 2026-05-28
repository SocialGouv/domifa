import { UserStructure } from "./UserStructure.interface";

export type UsersForAdminList = Pick<
  UserStructure,
  | "id"
  | "uuid"
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "status"
  | "structureId"
  | "lastLogin"
  | "passwordLastUpdate"
  | "createdAt"
> & {
  structureUuid: string;
  structureName: string;
  temporaryTokens?: {
    type?: string;
    token?: string;
    validity?: Date;
  };
  remainingBackoffMinutes?: number | null;
};
