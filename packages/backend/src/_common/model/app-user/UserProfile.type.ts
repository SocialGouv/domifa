import { AppUser } from "./AppUser.type";

export type UserProfile = Pick<
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
