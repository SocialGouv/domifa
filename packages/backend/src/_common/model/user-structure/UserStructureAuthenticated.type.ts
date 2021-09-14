import { StructureCommon } from "../structure/StructureCommon.type";
import { UserStructurePublic } from "./UserStructurePublic.type";

export type UserStructureAuthenticated = UserStructurePublic & {
  structure: StructureCommon;
};
