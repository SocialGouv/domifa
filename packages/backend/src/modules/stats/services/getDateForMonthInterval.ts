import { startOfMonth, subYears, format } from "date-fns";

export const getDateForMonthInterval = (): {
  startDate: string;
  endDate: string;
} => {
  const lastMonth = startOfMonth(new Date());
  const oneYearAgo = subYears(lastMonth, 1);

  const startDate = format(oneYearAgo, "yyyy-MM-dd");
  const endDate = format(lastMonth, "yyyy-MM-dd");

  return { startDate, endDate };
};
