import { ucFirst } from "../usagers/services/custom-docs";

export const cleanAddress = (address: string): string => {
  if (!address) {
    return "";
  }
  return address
    .toString()
    .trim()
    .toLowerCase()
    .replace(",", "")
    .replace(".", "")
    .replace("/", "-")
    .replace(" b ", "")
    .replace(" , ", "")
    .replace(" bis ", "")
    .replace(" ter ", "")
    .replace(/\s+/g, " ")
    .trim();
};

export const cleanCity = (city: string): string => {
  if (!city) {
    return "";
  }
  city = city
    .toString()
    .trim()
    .toLowerCase()
    .replace(".", "")
    .replace(",", "")
    .replace("/", "-")
    .replace("cedex", "")
    .replace(" BP ", "")
    .replace("éme arrondissement", "")
    .replace("eme arrondissement", "")
    .replace("ème arrondissement", "")
    .replace(/[0-9]/g, "")
    .replace(/\s+/g, " ");

  return ucFirst(city);
};
