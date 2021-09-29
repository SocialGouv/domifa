import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

export function isInteger(value: any): value is number {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) === value
  );
}

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

export function formatDateToNgb(date: Date): NgbDateStruct | null {
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
  if (ngbDate === null) {
    return null;
  }
  return new Date(Date.UTC(ngbDate.year, ngbDate.month, ngbDate.day));
}

export const minDateNaissance = { day: 1, month: 1, year: 1900 };

export const minDateToday = {
  day: new Date().getDate(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};
