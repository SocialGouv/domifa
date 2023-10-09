import { removeAccents } from "../sms/services/generators";
import { ucFirst } from "../usagers/services/custom-docs";

export const cleanAddress = (address: string): string => {
  if (!address) {
    return "";
  }

  return removeAccents(address)
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\//g, "-")
    .replace(/\b(bis|ter|quater|b)\b/g, "")
    .replace(/[0-9]+(?=[a-z])/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const cleanCity = (city: string): string => {
  if (!city) {
    return "";
  }

  city = removeAccents(city)
    .toLowerCase()
    .replace(/[.,/-]/g, " ")
    .replace(/\b(cedex|BP)\b/g, "")
    .replace(/[0-9]/g, "")
    .replace(/\b[0-9]+(?:eme)? arrondissement\b/g, "")
    .replace(/\s+/g, " ");

  return ucFirst(city.trim());
};
