import { StructureFilterCriteria, structuresSearchFilter } from ".";
import { StructureAdmin } from "../types";

export const structuresFilter = {
  filter,
};
function filter(
  items: StructureAdmin[],
  {
    criteria,
  }: {
    criteria: StructureFilterCriteria;
  }
): StructureAdmin[] {
  return structuresSearchFilter(items, criteria);
}
