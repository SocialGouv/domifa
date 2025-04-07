import { StructureCommon } from "@domifa/common";
import { UserAuthenticated } from "../common-user/UserAuthenticated.type";
import { UserStructurePublic } from "./UserStructurePublic.type";

export type UserStructureAuthenticated = UserAuthenticated<"structure"> &
  UserStructurePublic & {
    structure: StructureCommon;
  };
