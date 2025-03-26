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
  } else if (type === "number") {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  return value;
}
