import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export function toInteger(value: string): number {
  return parseInt(`${value}`, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumber(value: any): boolean {
  return !isNaN(toInteger(value));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}

export function padNumber(value: number): string {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return "";
  }
}

export function isToday(someDate?: Date): boolean {
  if (!someDate) {
    return false;
  }
  const today = new Date();

  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
}

export function formatDateToNgb(date: Date | null): NgbDateStruct | null {
  if (!date) {
    return null;
  }
  if (!date.getDate) {
    date = new Date(date);
  }
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function parseDateFromNgb(ngbDate: NgbDateStruct): Date {
  return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
}

export const minDateNaissance = { day: 1, month: 1, year: 1900 };

export const minDateToday = {
  day: new Date().getDate(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};
