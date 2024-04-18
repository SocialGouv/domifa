import { StructureCommon, Usager } from "@domifa/common";
import { UserAuthenticated } from "../user/UserAuthenticated.type";
import { UserUsager } from "./UserUsager.interface";

export type UserUsagerAuthenticated = UserAuthenticated<"usager"> & {
  structure: StructureCommon;
  user: UserUsager;
  usager: Usager;
};
