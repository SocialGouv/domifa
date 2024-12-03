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
    // En tri descendant, null/undefined descendent en bas
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
  }

  // Détecter si c'est une date valide
  if (isValidDate(a) && isValidDate(b)) {
    const dateA = new Date(a as string);
    const dateB = new Date(b as string);
    return asc
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  }

  // Détecter si c'est un nombre ou une chaîne numérique
  const numA = typeof a === "string" ? parseFloat(a) : Number(a);
  const numB = typeof b === "string" ? parseFloat(b) : Number(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return asc ? numA - numB : numB - numA;
  }

  // Par défaut, comparer comme du texte
  const strA = String(a);
  const strB = String(b);
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
