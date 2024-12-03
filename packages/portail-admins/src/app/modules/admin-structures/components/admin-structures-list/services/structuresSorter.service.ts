import {
  normalizeString,
  Search,
  SortableValue,
  sortMultiple,
} from "@domifa/common";
import { StructureAdmin } from "../../../types";

export const structuresSorter = {
  sortBy,
};

function sortBy(
  structures: StructureAdmin[],
  { sortKey, sortValue }: Pick<Search, "sortKey" | "sortValue">
) {
  const asc = sortValue !== "desc";

  if (!sortKey) {
    return structures;
  }

  return sortMultiple(structures, asc, (structure) => {
    const sortAttributes: SortableValue[] = [];

    let value = structure[sortKey as keyof StructureAdmin];

    if (
      ["nom", "structureTypeLabel", "regionLabel", "departementLabel"].includes(
        sortKey
      )
    ) {
      value = normalizeString(value as string);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortAttributes.push(value as any);
    sortAttributes.push(normalizeString(structure.nom));

    return sortAttributes;
  });
}
