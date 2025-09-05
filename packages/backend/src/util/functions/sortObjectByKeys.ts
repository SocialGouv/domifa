export function sortObjectByKeys<T extends Record<string, any>>(
  obj: T,
  direction: "asc" | "desc" = "asc"
): T {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) =>
      direction === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    )
  ) as T;
}
