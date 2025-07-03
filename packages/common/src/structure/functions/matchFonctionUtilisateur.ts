import { normalizeString } from "../../search";
import { NORMALIZED_USER_FONCTIONS } from "../../users/user-structure/constants";

export function matchFonctionUtilisateur(input: string): string | null {
  if (!input) return "Autre";

  const normalizedInput = normalizeString(input);

  for (const fonction of NORMALIZED_USER_FONCTIONS) {
    if (fonction.normalizedSynonyms.includes(normalizedInput)) {
      return fonction.canonicalName;
    }

    for (const synonym of fonction.normalizedSynonyms) {
      if (
        normalizedInput.includes(synonym) ||
        synonym.includes(normalizedInput)
      ) {
        return fonction.canonicalName;
      }
    }
  }

  return null;
}
