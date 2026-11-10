import { UserSupervisor } from "../interfaces";

// DDETS or DREETS account as listed to the DREETS managing its region
export type RegionManagedUser = Pick<
  UserSupervisor,
  | "uuid"
  | "nom"
  | "prenom"
  | "email"
  | "status"
  | "lastLogin"
  | "passwordLastUpdate"
  | "createdAt"
  | "territories"
  | "role"
>;
