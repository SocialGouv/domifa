import { ucFirst } from "../../functions";
import { removeAccents } from "./remove-accents";

export const cleanCity = (city: string): string => {
  if (!city) {
    return "";
  }

  city = removeAccents(city)
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")

    .replace(/\b(cedex|bp|cs)\b/g, "")

    .replace(/\beme arrondissement\b/g, "")
    .replace(/\s+/g, " ");

  return ucFirst(city.trim());
};

export const padPostalCode = (codePostal: string | number): string => {
  const cleanCode = codePostal
    ?.toString()
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim();

  if (!cleanCode) {
    return null;
  }

  return cleanCode.padStart(5, "0");
};
