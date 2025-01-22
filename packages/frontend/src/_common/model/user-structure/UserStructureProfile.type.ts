import { UserStructure } from "@domifa/common";

export type UserStructureProfile = Pick<
  UserStructure,
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "id"
  | "verified"
  | "uuid"
  | "createdAt"
  | "lastLogin"
>;
