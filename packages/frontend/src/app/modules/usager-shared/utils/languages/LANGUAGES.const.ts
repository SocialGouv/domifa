import { ORIGINAL_LANGUAGES_MAP } from "./ORIGINAL_LANGUAGES_MAP.const";

export const LANGUAGES = Object.values(ORIGINAL_LANGUAGES_MAP)
  .filter((x) => x["639-2"] && x["639-1"] && x.fr.length)
  .map((x) => ({
    isoCode: x["639-1"],
    label: x.fr[0].replace(/\b\w/g, (c) => c.toUpperCase()),
  }))
  .filter(
    (item, index, self) =>
      self.findIndex((t) => t.isoCode === item.isoCode) === index
  )
  .sort((a, b) => new Intl.Collator("fr").compare(a.label, b.label));

export const LANGUAGES_MAP = Object.fromEntries(
  LANGUAGES.map((l) => [l.isoCode, l])
);
