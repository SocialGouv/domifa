import { endOfDay, startOfDay, subDays } from "date-fns";

export const usagerHistoryStateManager = {
  getHistoryBeginDate,
  getHistoryEndDateFromNextBeginDate,
};

export function getHistoryBeginDate(date: Date) {
  return startOfDay(new Date(date));
}

export function getHistoryEndDateFromNextBeginDate(date: Date) {
  return endOfDay(subDays(new Date(date), 1));
}
