import { StructurePublic } from "../structure/StructurePublic.type";
import { AppUserPublic } from "./AppUserPublic.type";

export type AppAuthUser = AppUserPublic & {
  structure: StructurePublic;
};
