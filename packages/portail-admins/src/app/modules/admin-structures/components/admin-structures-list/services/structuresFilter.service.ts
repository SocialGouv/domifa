import { structuresSearchFilter } from "./structuresSearchStringFilter.service";
import { StructureAdmin } from "../../../types";
import { StructureFilterCriteria } from "../../../utils/structure-filter-criteria";

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
