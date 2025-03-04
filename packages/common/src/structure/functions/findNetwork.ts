import { normalizeString } from "../../search";
import { NORMALIZED_NETWORKS } from "../constants";

export function findNetwork(input: string): string | null {
  if (!input) return "Autre réseau";

  const normalizedInput = normalizeString(input);

  for (const network of NORMALIZED_NETWORKS) {
    if (network.normalizedSynonyms.includes(normalizedInput)) {
      return network.canonicalName;
    }

    for (const synonym of network.normalizedSynonyms) {
      if (
        normalizedInput.includes(synonym) ||
        synonym.includes(normalizedInput)
      ) {
        return network.canonicalName;
      }
    }
  }

  return null;
}
