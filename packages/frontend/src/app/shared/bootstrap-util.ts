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

export function formatDateToNgb(date: Date): NgbDate {
  if (!date.getDate) {
    date = new Date(date);
  }
  return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function parseDateFromNgb(ngbDate: NgbDate): Date {
  return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
}

export const minDateNaissance = { day: 1, month: 1, year: 1900 };

export const minDateToday = {
  day: new Date().getDate(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

export const createDate = (date?: Date | string | null): Date | null => {
  return date ? new Date(date) : null;
};
