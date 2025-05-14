import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { nextDay, Day } from "date-fns";
import { Structure, TimeZone } from "@domifa/common";

const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function getNextClosestDay(days: string[], dateReference: Date): Day {
  const todayIndex = dateReference.getDay() as Day;
  const currentHour = dateReference.getHours();

  const dayIndices = days
    .map((day) => dayNames.indexOf(day.toLowerCase()) as Day)
    .filter((index) => index >= 1 && index <= 5) // Keep only working days (Monday to Friday)
    .sort((a, b) => a - b);

  if (dayIndices.length === 0) {
    throw new Error("No working days enabled in schedule");
  }

  const isAfterHours = currentHour >= 19;
  const isWeekend = todayIndex === 0 || todayIndex === 6;
  const isFriday = todayIndex === 5;

  if (isWeekend || (isFriday && isAfterHours)) {
    return dayIndices[0];
  }

  const effectiveIndex = isAfterHours
    ? (((todayIndex + 1) % 7) as Day)
    : todayIndex;

  for (const dayIndex of dayIndices) {
    if (dayIndex >= effectiveIndex) {
      return dayIndex;
    }
  }

  return dayIndices[0];
}

export const generateScheduleSendDate = (
  structure: Pick<Structure, "sms">,
  dateReference: Date = new Date(),
  timeZone: TimeZone
): Date => {
  const days: string[] = Object.keys(structure.sms.schedule).filter(
    (day: string) => structure.sms.schedule[day]
  );

  const userDateReference = utcToZonedTime(dateReference, timeZone);
  const nextDayId = getNextClosestDay(days, userDateReference);

  let userBaseDate;
  const today = userDateReference.getDay() as Day;

  if (nextDayId === today) {
    userBaseDate = new Date(userDateReference);
  } else {
    userBaseDate = nextDay(userDateReference, nextDayId);
  }

  userBaseDate.setHours(19, 0, 0, 0);

  return zonedTimeToUtc(userBaseDate, timeZone);
};
