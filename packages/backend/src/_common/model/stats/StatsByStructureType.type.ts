import { StructureType } from "../structure";

export type StatsByStructureType = {
  [key in StructureType]: number;
};
