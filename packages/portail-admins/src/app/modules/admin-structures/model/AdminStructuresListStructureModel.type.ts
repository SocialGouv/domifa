import { StructureAdmin } from "../types";

export type AdminStructuresListStructureModel = StructureAdmin & {
  structureTypeLabel: string;
  regionLabel: string;
  departementLabel: string;
};
