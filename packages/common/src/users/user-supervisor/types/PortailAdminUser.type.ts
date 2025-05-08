import { UserSupervisor } from "../interfaces";

export type PortailAdminUser = Pick<
  UserSupervisor,
  | "id"
  | "uuid"
  | "nom"
  | "prenom"
  | "email"
  | "verified"
  | "lastLogin"
  | "territories"
  | "role"
>;
