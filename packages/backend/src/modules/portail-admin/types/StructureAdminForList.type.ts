import { StructureAdmin } from "./StructureAdmin.type";

export type StructureAdminForList = StructureAdmin & {
  users: number;
  usagers: number;
  actifs: number;
};
