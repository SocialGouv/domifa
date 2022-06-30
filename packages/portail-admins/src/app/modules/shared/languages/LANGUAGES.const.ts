import { dataCompare } from "../services/data";
import { AppLanguage } from "./AppLanguage.type";
import { ORIGINAL_LANGUAGES_MAP } from "./ORIGINAL_LANGUAGES_MAP.const";

const codes: string[] = [];
const TMP_LANGUAGES = Object.values(ORIGINAL_LANGUAGES_MAP)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .filter((x) => !!x["639-2"] && !!(x as any)["639-1"] && x.fr.length !== 0)
  .map((x) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isoCode: (x as any)["639-1"],
    label: uppercaseFirstEveryWords(x.fr[0]),
  }))
  .filter((item) => {
    if (!codes.includes(item.isoCode)) {
      codes.push(item.isoCode);
      return true;
    }
    return false;
  });

TMP_LANGUAGES.sort((a, b) => {
  return dataCompare.compareAttributes(a.label, b.label, {
    asc: true,
  });
});

export const LANGUAGES = TMP_LANGUAGES;

export const LANGUAGES_MAP: { [attr: string]: AppLanguage } = LANGUAGES.reduce(
  (acc, l) => {
    acc[l.isoCode] = l;
    return acc;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  },
  {} as { [attr: string]: AppLanguage }
);

function uppercaseFirstEveryWords(words: string) {
  return words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
