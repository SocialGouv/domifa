import { StructureCommon } from "@domifa/common";
import { UserAuthenticated } from "../user/UserAuthenticated.type";
import { UserStructurePublic } from "./UserStructurePublic.type";

export type UserStructureAuthenticated = UserAuthenticated<
  "structure" | "super-admin-domifa"
> &
  UserStructurePublic & {
    structure: StructureCommon;
  };
