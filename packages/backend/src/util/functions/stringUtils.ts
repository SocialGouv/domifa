import { TimeZone } from "@domifa/common";
import { format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { fr } from "date-fns/locale";

export const formatBoolean = (element: boolean): string => {
  return element ? "OUI" : "NON";
};

export const ucFirst = (value: string) => {
  return !value || value === ""
    ? ""
    : value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatOtherField = (
  value: string | null,
  detail: string | null,
  mapping: Record<string, string>,
  prefix: string = "Autre"
): string => {
  if (!value) return "";

  if (value === "AUTRE" && detail) {
    return `${prefix}: ${ucFirst(detail)}`;
  }

  return mapping[value] || "";
};

export const formatDetailField = (
  isEnabled: boolean | null,
  detail: string | null
): string => {
  if (!isEnabled) return "";
  {
    return ucFirst(detail || "");
  }
};

export const dateFormat = (
  date: Date | string,
  timeZone: TimeZone,
  displayFormat: string
): string => {
  if (!date || date === "") {
    return "";
  }

  if (typeof date === "string") {
    date = new Date(date);
  }
  // On Repasse en UTC pour convertir correctement
  date = zonedTimeToUtc(date, "Europe/Paris");
  // On repasse sur la bonne timezone
  date = utcToZonedTime(date, timeZone);

  return format(date, displayFormat, {
    locale: fr,
  });
};
