import { removeAccents } from "../../../sms/services/generators";
import { ucFirst } from "../../../usagers/services/custom-docs";

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
