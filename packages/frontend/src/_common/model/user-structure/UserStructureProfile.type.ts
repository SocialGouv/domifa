import { UserStructure } from "@domifa/common";

export type UserStructureProfile = Pick<
  UserStructure,
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "verified"
  | "uuid"
  | "createdAt"
  | "lastLogin"
>;
