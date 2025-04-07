import { UserSupervisor } from "@domifa/common";

// UserStructure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type UserSupervisorPublic = Pick<
  UserSupervisor,
  | "id"
  | "uuid"
  | "createdAt"
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "verified"
  | "acceptTerms"
  | "lastLogin"
>;
