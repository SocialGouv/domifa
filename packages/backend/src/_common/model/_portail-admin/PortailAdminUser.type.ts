import { UserStructure } from "@domifa/common";

export type PortailAdminUser = Pick<
  UserStructure,
  | "id"
  | "nom"
  | "prenom"
  | "email"
  | "password"
  | "verified"
  | "lastLogin"
  | "territories"
  | "userRightStatus"
>;
