import { StructureAdmin } from "@domifa/common";
import { StructureFilterCriteria, structuresSearchFilter } from ".";

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
