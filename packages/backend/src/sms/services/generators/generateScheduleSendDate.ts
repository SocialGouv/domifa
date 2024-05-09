import { Structure } from "@domifa/common";
import { Day, nextDay } from "date-fns";

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
  dateReference: Date = new Date()
): Date => {
  const days: string[] = Object.keys(structure.sms.schedule).filter(
    (day: string) => structure.sms.schedule[day]
  );

  const nextDayId = getNextClosestDay(days, dateReference);

  const nextDate = nextDay(dateReference, nextDayId as Day);
  nextDate.setHours(19, 0, 0);
  return nextDate;
};

function getNextClosestDay(days: string[], dateReference: Date): number {
  const todayIndex = dateReference.getDay();
  const dayIndices = days.map((day) => weekDays.indexOf(day.toLowerCase()));

  dayIndices.sort((a, b) => a - b);

  for (const dayIndex of dayIndices) {
    if (dayIndex >= todayIndex) {
      return dayIndex;
    }
  }
  return dayIndices[0];
}
