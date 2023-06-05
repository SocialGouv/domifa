import { StructureType } from "../../../app/modules/structures/types";

export type StatsByStructureType = {
  [key in StructureType]: number;
};
