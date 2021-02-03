import { diacritics } from "./diacritics";

function trim(str: string): string {
  return str.replace(/^\s+|\s+$/g, "");
}

function clean(str: string): string {
  if (!str) {
    return str;
  }
  return diacritics.clean(trim(str).toLowerCase());
}

function buildWords(searchText: string): string[] {
  const str = searchText ? clean(searchText) : undefined;
  if (!str || !str.length) {
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
