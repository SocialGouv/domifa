import { removeAccents } from "../../../sms/services/generators";
import { STREET_ABREVIATIONS } from "../constants";

export const cleanAddress = (address: string): string => {
  if (!address) {
    return "";
  }

  const cleanAddress = removeAccents(address)
    .toLowerCase()
    .replace(/\'/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/(\bbis\b|\bter\b|\bquater\b|\bb\b)/g, "")
    .replace(/(\d)(bis|ter|quater|b)/g, "$1")
    .replace(/\bbp \d+\b/g, "")
    .replace(/\bcs \d+\b/g, "")

    .replace(/\s+/g, " ")
    .trim();

  return replaceAbbreviations(cleanAddress);
};

export function formatAddressForURL(address: string): string {
  return cleanAddress(address).replace(/ /g, "+");
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
