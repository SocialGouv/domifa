import { startOfMonth, subYears, format } from "date-fns";
import { domifaConfig } from "../../config";

export const getDateForMonthInterval = (): {
  startDate: string;
  endDate: string;
} => {
  const dateRef =
    domifaConfig().envId === "test" ? new Date("2022-07-31") : new Date();

  const lastMonth = startOfMonth(dateRef);
  const oneYearAgo = subYears(lastMonth, 1);

  const startDate = format(oneYearAgo, "yyyy-MM-dd");
  const endDate = format(lastMonth, "yyyy-MM-dd");

  return { startDate, endDate };
};
