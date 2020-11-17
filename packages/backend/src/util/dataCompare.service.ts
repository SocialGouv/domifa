import { diacritics } from "./diacritics";

export const dataCompare = {
  compareAttributes,
  compareNullValues,
  cleanString,
};

export type DataComparisonResult = 0 | 1 | -1;

function cleanString(str: string) {
  if (!str) {
    return str;
  }
  return diacritics.clean(str.trim().toLowerCase());
}

function compareAttributes<T>(
  a: T,
  b: T,
  { asc, nullFirst }: { asc: boolean; nullFirst?: boolean }
): DataComparisonResult {
  const nullComparison = compareNullValues(a, b, { nullFirst });

  if (nullComparison === undefined) {
    const comparison = a > b ? 1 : a < b ? -1 : 0;
    if (asc || comparison === 0) {
      return comparison;
    } else {
      return -comparison as DataComparisonResult;
    }
  }
  return nullComparison;
}

function compareNullValues<T>(
  a: T,
  b: T,
  { nullFirst }: { nullFirst?: boolean }
): DataComparisonResult {
  if (a == null && b == null) {
    return 0;
  } else if (a == null && b != null) {
    if (nullFirst) {
      return -1;
    } else {
      return 1;
    }
  } else if (a != null && b == null) {
    if (nullFirst) {
      return 1;
    } else {
      return -1;
    }
  } else {
    return undefined;
  }
}
