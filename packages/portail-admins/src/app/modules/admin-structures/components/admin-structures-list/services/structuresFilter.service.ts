import {
  AdminStructureSListFilterCriteria,
  AdminStructuresListStructureModel,
} from "../../../model";
import { structuresSearchStringFilter } from "./structuresSearchStringFilter.service";
import { structuresSorter } from "./structuresSorter.service";

export const structuresFilter = {
  filter,
};
function filter(
  items: AdminStructuresListStructureModel[],
  {
    criteria,
  }: {
    criteria: AdminStructureSListFilterCriteria;
  }
): AdminStructuresListStructureModel[] {
  const { sortAttribute } = criteria;

  const filteredStructures = filterByCriteria(items, criteria);

  const filteredAndSearchUsagers = structuresSearchStringFilter.filter(
    filteredStructures,
    {
      searchString: criteria.searchString,
    }
  );

  return structuresSorter.sortBy(filteredAndSearchUsagers, {
    sortAttribute,
  });
}
function filterByCriteria(
  items: AdminStructuresListStructureModel[],
  criteria: AdminStructureSListFilterCriteria
) {
  if (criteria.verified !== undefined) {
    return items.filter((item) => {
      return item.verified === criteria.verified;
    });
  }
  return items;
}
