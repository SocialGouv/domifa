import { StructureType } from "@domifa/common";

export type StatsByStructureType = {
  [key in StructureType]: number;
};
