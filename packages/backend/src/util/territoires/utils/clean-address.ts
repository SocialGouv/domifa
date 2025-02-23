import { STREET_ABREVIATIONS } from "../constants";
import { removeAccents } from "./remove-accents";

export const cleanSpaces = (str: string): string => {
  if (!str) {
    return "";
  }
  return str.trim().replace(/\s+/g, " ");
};

export const cleanAddress = (address: string): string => {
  if (!address) {
    return "";
  }

  const cleanedAddress = removeAccents(address)
    .toLowerCase()
    // Supprime les guillemets et caractères spéciaux en début/fin
    .replace(/^["«\s]+|["»\s]+$/g, "")
    // Nettoie toute lettre après un numéro en début de chaîne (2A, 2bis, 2ter, etc.)
    .replace(/^(\d+)[a-z]+\s/i, "$1 ")
    // Nettoie les plages d'adresses
    .replace(/^(\d+)[-\/]\d+/g, "$1")
    // Supprime les mentions BP, CS et numéros associés
    .replace(/\b(bp|cs)\s*\d+\b/gi, "")
    // Supprime les suffixes courants après les numéros
    .replace(/\b(bis|ter|quater|quarter|b)\b/gi, "")
    // Remplace les apostrophes par des espaces
    .replace(/['\u2019]/g, " ")
    // Supprime tous les caractères spéciaux restants
    .replace(/[^a-z0-9\s]/g, "")
    // Supprime les espaces multiples et retours chariot
    .replace(/\s+/g, " ")
    .trim();

  return replaceAbbreviations(cleanedAddress);
};

export function formatAddressForURL(address: string): string {
  return cleanAddress(address).replace(/ /g, "-");
}

export function replaceAbbreviations(str: string): string {
  let result = str;
  for (const abbr in STREET_ABREVIATIONS) {
    const regex = new RegExp("(\\b|\\s)" + abbr + "\\.?\\b", "gi");
    result = result.replace(regex, (_match, p1) => {
      const preSpace = p1 === " " ? " " : "";
      return preSpace + STREET_ABREVIATIONS[abbr];
    });
  }
  return result;
}
