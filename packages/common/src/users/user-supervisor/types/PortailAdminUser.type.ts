import { UserSupervisor } from "../interfaces";

export type PortailAdminUser = Pick<
  UserSupervisor,
  | "id"
  | "nom"
  | "prenom"
  | "email"
  | "verified"
  | "lastLogin"
  | "territories"
  | "role"
>;
