export function cleanFormDataValue(
  value: any,
  type: "string" | "number"
): string | number | null {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null" ||
    value === "undefined"
  ) {
    return null;
  }

  if (type === "string") {
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  }

  if (type === "number") {
    if (value === null || value === undefined || value === "") {
      return Number.NaN;
    }
    const num = Number(value);

    return Number.isNaN(num) ? Number.NaN : num;
  }

  return Number.NaN;
}
