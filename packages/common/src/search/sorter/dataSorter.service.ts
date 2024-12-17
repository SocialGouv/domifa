export type SortableValue = string | number | Date | null | undefined;

export const compareAttributes = (
  a: SortableValue,
  b: SortableValue,
  asc: boolean
): number => {
  if (a === b) return 0;
  if (asc) {
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;
  } else {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
  }

  // Conversion immédiate en string
  const strA = a === null || a === undefined ? "" : String(a);
  const strB = b === null || b === undefined ? "" : String(b);

  // Pour les dates, garder le comportement spécial
  if (isValidDate(a) && isValidDate(b)) {
    const dateA = new Date(strA);
    const dateB = new Date(strB);
    return asc
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  }

  // Comparaison simple en string
  return asc ? strA.localeCompare(strB) : strB.localeCompare(strA);
};

export const sortMultiple = <T>(
  items: T[],
  asc: boolean,
  getSortAttributes: (item: T) => SortableValue[]
): T[] => {
  return items.sort((a, b) => {
    const attrsA = getSortAttributes(a);
    const attrsB = getSortAttributes(b);

    for (let i = 0; i < attrsA.length; i++) {
      const attrA = attrsA[i];
      const attrB = attrsB[i];

      const comparison = compareAttributes(attrA, attrB, asc !== false);
      if (comparison !== 0) {
        return comparison;
      }
    }

    return 0;
  });
};

function isValidDate(value?: SortableValue): boolean {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}
