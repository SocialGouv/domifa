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
