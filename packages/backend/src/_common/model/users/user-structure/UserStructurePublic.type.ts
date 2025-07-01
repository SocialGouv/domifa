import { UserStructure } from "@domifa/common";

// UserStructure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type UserStructurePublic = Pick<
  UserStructure,
  | "id"
  | "uuid"
  | "createdAt"
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "fonction"
  | "detailFonction"
  | "verified"
  | "structureId"
  | "acceptTerms"
  | "lastLogin"
>;
