import { StructureCommon } from "../structure/StructureCommon.type";
import { AppUserPublic } from "./AppUserPublic.type";

export type AppAuthUser = AppUserPublic & {
  structure: StructureCommon;
};
