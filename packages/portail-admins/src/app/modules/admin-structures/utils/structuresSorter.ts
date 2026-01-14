import {
  normalizeString,
  Search,
  SortableValue,
  sortMultiple,
  StructureAdmin,
} from "@domifa/common";

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

  if (["id", "users", "actifs", "usagers"].includes(sortKey)) {
    return structures.sort((a, b) => {
      const valueA = a[sortKey as keyof StructureAdmin] as number;
      const valueB = b[sortKey as keyof StructureAdmin] as number;
      return sortNumeric(valueA, valueB, asc);
    });
  }

  return sortMultiple(structures, asc, (structure) => {
    const sortAttributes: SortableValue[] = [];

    let value = structure[sortKey as keyof StructureAdmin];

    if (
      ["nom", "structureType", "regionName", "departementName"].includes(
        sortKey
      )
    ) {
      value = normalizeString(value as string);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortAttributes.push(value as any);
    sortAttributes.push(structure.nom);
    return sortAttributes;
  });
}

export const sortNumeric = (a: number, b: number, asc: boolean): number => {
  return asc ? a - b : b - a;
};
