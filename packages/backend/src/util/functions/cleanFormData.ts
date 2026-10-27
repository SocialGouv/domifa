import { parseStrictInt } from "../../_common/decorators/parse-pipes/ParseStrictInt.pipe";

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
    if (typeof value === "number") {
      return value;
    }
    return parseStrictInt(value) ?? Number.NaN;
  }

  return Number.NaN;
}
