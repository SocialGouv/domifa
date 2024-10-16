import { dataCompare } from "../../../manage-usagers/utils/sorter";
import { AppLanguage } from "./AppLanguage.type";
import { ORIGINAL_LANGUAGES_MAP } from "./ORIGINAL_LANGUAGES_MAP.const";

const codes: string[] = [];

const TMP_LANGUAGES = Object.values(ORIGINAL_LANGUAGES_MAP)
  .filter((x) => !!x["639-2"] && !!x["639-1"] && x.fr.length !== 0)
  .map((x) => {
    return {
      isoCode: x["639-1"],
      label: uppercaseFirstEveryWords(x.fr[0]),
    } as AppLanguage;
  })
  .filter((item: AppLanguage) => {
    if (!codes.includes(item?.isoCode)) {
      codes.push(item?.isoCode);
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
  (acc, l: AppLanguage) => {
    acc[l.isoCode] = l;
    return acc;
  },
  {} as { [attr: string]: AppLanguage }
);

function uppercaseFirstEveryWords(words: string) {
  return words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
