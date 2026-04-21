import { subDays, addYears } from "date-fns";

export function toInteger(value: string): number {
  return Number.parseInt(`${value}`, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumber(value: any): boolean {
  return !isNaN(toInteger(value));
}

export function padNumber(value: number): string {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return "";
  }
}

export const minDateToday = {
  day: new Date().getDate(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

export function toNoon(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
      0,
      0,
      0
    )
  );
}

export function getToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      12,
      0,
      0,
      0
    )
  );
}

export function getNextYear(startDate: Date): Date {
  return subDays(addYears(toNoon(startDate), 1), 1);
}
