import { StructureCustomDocKeys } from "./StructureCustomDocKeys.type";
export type StructureCustomDocTags = {
  [key in StructureCustomDocKeys]?: string | Date | number;
};
