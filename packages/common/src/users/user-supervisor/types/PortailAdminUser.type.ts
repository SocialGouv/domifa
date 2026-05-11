import { UserSupervisor } from "../interfaces";

export type PortailAdminUser = Pick<
  UserSupervisor,
  | "id"
  | "uuid"
  | "nom"
  | "prenom"
  | "email"
  | "status"
  | "lastLogin"
  | "territories"
  | "role"
>;
