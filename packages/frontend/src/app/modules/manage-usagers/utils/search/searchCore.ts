import { normalizeString } from "@domifa/common";

export function trim(str: string): string {
  return str.trim();
}

export function clean(str: string): string {
  if (!str) {
    return str;
  }
  return normalizeString(trim(str).toLowerCase());
}

export function buildWords(searchText: string): string[] {
  const str = searchText ? clean(searchText) : undefined;
  if (!str?.length) {
    return [];
  }
  return str
    .split(" ")
    .filter((x) => x !== null && x !== undefined && x.trim().length !== 0)
    .map((word) => clean(word));
}

export const searchCore = {
  trim,
  clean,
  buildWords,
};
