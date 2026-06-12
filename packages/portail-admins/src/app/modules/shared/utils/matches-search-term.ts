export function matchesSearchTerm<T>(
  item: T,
  rawTerm: string,
  fields: (keyof T)[]
): boolean {
  const term = rawTerm.trim().toLowerCase();
  if (!term) {
    return true;
  }
  const haystack = fields
    .map((field) => item[field])
    .filter((value): value is NonNullable<typeof value> => value != null)
    .map((value) => String(value))
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}
