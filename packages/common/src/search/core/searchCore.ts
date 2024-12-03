import { normalizeString } from "../functions";

export const trim = (str: string): string => {
  return str.trim();
};

export const clean = (str: string): string => {
  if (!str) {
    return str;
  }
  return normalizeString(trim(str).toLowerCase());
};

export const buildWords = (searchText: string): string[] => {
  const str = searchText ? clean(searchText) : undefined;
  if (!str?.length) {
    return [];
  }
  return str
    .split(" ")
    .filter((x) => x !== null && x !== undefined && x.trim().length !== 0)
    .map((word) => clean(word));
};
