import { isNil } from "lodash";
import { isValid, parse, startOfDay } from "date-fns";
import striptags from "striptags";

export const getDateFromXml = (dateString: string | number): Date => {
  const parsedDate = startOfDay(
    parse(dateString.toString(), "yyyyMMdd", new Date())
  );
  if (!isValid(parsedDate)) {
    throw new Error("CANNOT ADD DATE " + dateString);
  }
  return parsedDate;
};

export const getText = (str?: string): string => {
  if (isNil(str)) {
    return "";
  }

  return striptags(str.toString())
    .replace(/[\\$~*<>{}]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};
