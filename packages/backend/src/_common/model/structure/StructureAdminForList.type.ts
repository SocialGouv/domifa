import { StructureAdmin } from "./StructureAdmin.type";

export type StructureAdminForList = StructureAdmin & {
  usersCount: number;
  usagersValidCount: number;
  usagersAllCount: number;
  usagersAyantsDroitsCount: number;
};
