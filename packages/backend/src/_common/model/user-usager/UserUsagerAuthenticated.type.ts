import { StructureCommon } from "../structure/StructureCommon.type";
import { Usager } from "../usager/Usager.type";
import { UserAuthenticated } from "../user/UserAuthenticated.type";
import { UserUsager } from "./UserUsager.interface";

export type UserUsagerAuthenticated = UserAuthenticated<"usager"> & {
  structure: StructureCommon;
  user: UserUsager;
  usager: Usager;
};
