import { AppUser } from "./AppUser.type";

// AppUser: attributs publics (retournés au frontend via AppAuthUser)
export type AppUserPublic = Pick<
  AppUser,
  | "id"
  | "email"
  | "nom"
  | "prenom"
  | "role"
  | "verified"
  | "structureId"
  | "fonction"
>;
