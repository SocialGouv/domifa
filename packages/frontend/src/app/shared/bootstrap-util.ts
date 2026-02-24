import { NgbDate } from "@ng-bootstrap/ng-bootstrap";

export function toInteger(value: string): number {
  return parseInt(`${value}`, 10);
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

export function formatDateToNgb(date: Date | string): NgbDate {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();

  return new NgbDate(year, month, day);
}

export function parseDateFromNgb(ngbDate: NgbDate): Date {
  return new Date(
    Date.UTC(ngbDate.year, ngbDate.month - 1, ngbDate.day, 12, 0, 0)
  );
}
export function getTodayNgb(): NgbDate {
  const today = new Date();
  return new NgbDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );
}
export const minDateNaissance = { day: 1, month: 1, year: 1900 };

export const minDateToday = {
  day: new Date().getDate(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};
