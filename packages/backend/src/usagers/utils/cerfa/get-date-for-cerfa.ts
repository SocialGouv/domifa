import { utcToZonedTime } from "date-fns-tz";
import { UserStructureAuthenticated } from "../../../_common/model";
import { DateCerfa } from "../../constants/cerfa";

export const resetDate = (): DateCerfa => {
  return { annee: "", heure: "", jour: "", minutes: "", mois: "" };
};
import { parseISO, isValid, format } from "date-fns";

export function getDateForCerfa(
  date: Date | string | null,
  user?: UserStructureAuthenticated
): DateCerfa {
  if (date === null || typeof date === "undefined") {
    return resetDate();
  }

  const userTimezone = user?.structure.timeZone || "Europe/Paris";
  let dateObj: Date;

  if (typeof date === "string") {
    dateObj = parseISO(date);

    if (!isValid(dateObj)) {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }

  dateObj = utcToZonedTime(dateObj, userTimezone);

  return {
    annee: format(dateObj, "yyyy"),
    heure: format(dateObj, "HH"),
    minutes: format(dateObj, "mm"),
    jour: format(dateObj, "dd"),
    mois: format(dateObj, "MM"),
  };
}
