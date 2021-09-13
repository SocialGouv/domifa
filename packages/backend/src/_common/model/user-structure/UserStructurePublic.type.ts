import { UserStructure } from "./UserStructure.type";

// UserStructure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type UserStructurePublic = Pick<
  UserStructure,
  | "id"
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "verified"
  | "structureId"
  | "fonction"
  | "lastLogin"
>;
