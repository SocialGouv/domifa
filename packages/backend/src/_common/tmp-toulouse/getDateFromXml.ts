import { isValid, parse, startOfDay } from "date-fns";

export const getDateFromXml = (dateString: string | number): Date => {
  const parsedDate = startOfDay(
    parse(dateString.toString(), "yyyyMMdd", new Date())
  );
  if (!isValid(parsedDate)) {
    throw new Error("CANNOT ADD DATE " + dateString);
  }
  return parsedDate;
};
