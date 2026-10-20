import { UserSupervisor } from "../interfaces";

// DDETS account as listed to the DREETS managing its region
export type RegionDepartmentUser = Pick<
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
>;
