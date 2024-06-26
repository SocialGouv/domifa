import { UserUsager, StructureCommon, Usager } from "@domifa/common";
import { UserAuthenticated } from "../user/UserAuthenticated.type";

export type UserUsagerAuthenticated = UserAuthenticated<"usager"> & {
  structure: StructureCommon;
  user: UserUsager;
  usager: Usager;
};
