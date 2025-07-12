import { normalizeString } from "../../search";
import { UserFonction } from "../../users";
import { NORMALIZED_USER_FONCTIONS } from "../../users/user-structure/constants";

export function matchFonctionUtilisateur(input: string): UserFonction | null {
  if (!input) return UserFonction.AUTRE;

  const normalizedInput = normalizeString(input);

  for (const fonction of NORMALIZED_USER_FONCTIONS) {
    if (fonction.normalizedSynonyms.includes(normalizedInput)) {
      return fonction.canonicalName;
    }

    for (const synonym of fonction.normalizedSynonyms) {
      if (
        normalizedInput.includes(synonym) &&
        !fonction.normalizedExclude?.includes(normalizedInput)
      ) {
        return fonction.canonicalName;
      }
    }
  }

  return UserFonction.AUTRE;
}
