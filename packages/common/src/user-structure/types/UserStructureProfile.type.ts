import { UserStructure } from "../interfaces";

export type UserStructureProfile = Pick<
  UserStructure,
  | "uuid"
  | "id"
  | "role"
  | "nom"
  | "prenom"
  | "email"
  | "createdAt"
  | "lastLogin"
  | "structureId"
  | "verified"
>;
