import { Search } from "@domifa/common";
import { structuresSearchStringFilter } from "./structuresSearchStringFilter.service";
import { StructureAdmin } from "../../../types";

export const structuresFilter = {
  filter,
};
function filter(
  items: StructureAdmin[],
  {
    criteria,
  }: {
    criteria: Search;
  }
): StructureAdmin[] {
  return structuresSearchStringFilter.filter(items, {
    searchString: criteria.searchString,
  });
}
