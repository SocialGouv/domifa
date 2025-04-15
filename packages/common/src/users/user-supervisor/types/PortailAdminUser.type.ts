import { UserSupervisor } from "../interfaces";

export type PortailAdminUser = Pick<
  UserSupervisor,
  | "id"
  | "nom"
  | "prenom"
  | "email"
  | "password"
  | "verified"
  | "lastLogin"
  | "territories"
  | "role"
>;
