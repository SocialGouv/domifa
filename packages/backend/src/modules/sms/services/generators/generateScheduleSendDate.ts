import { Structure, TimeZone } from "@domifa/common";
import { Day, nextDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const weekDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const generateScheduleSendDate = (
  structure: Pick<Structure, "sms">,
  dateReference: Date = new Date(),
  timeZone: TimeZone
): Date => {
  const days: string[] = Object.keys(structure.sms.schedule).filter(
    (day: string) => structure.sms.schedule[day]
  );

  const nextDayId = getNextClosestDay(days, dateReference);

  const nextDate =
    nextDayId === dateReference.getDay() && dateReference.getUTCHours() < 19
      ? dateReference
      : nextDay(dateReference, nextDayId as Day);

  nextDate.setUTCHours(19, 0, 0);
  return utcToZonedTime(nextDate, timeZone);
};

function getNextClosestDay(days: string[], dateReference: Date): number {
  const todayIndex = dateReference.getDay();
  const dayIndices = days.map((day) => weekDays.indexOf(day.toLowerCase()));

  for (const dayIndex of dayIndices) {
    if (dayIndex >= todayIndex) {
      return dayIndex;
    }
  }
  return dayIndices[0];
}
