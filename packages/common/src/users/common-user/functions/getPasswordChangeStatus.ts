import { addMonths, differenceInDays, differenceInMonths } from "date-fns";

import {
  PASSWORD_CHANGE_EXPIRED_MONTHS,
  PASSWORD_CHANGE_WARNING_MONTHS,
} from "../constants";
import { PasswordChangeStatus, PasswordDateInput } from "../types";

export const getPasswordChangeStatus = (
  passwordLastUpdate: PasswordDateInput,
  createdAt: PasswordDateInput,
  now: Date = new Date()
): PasswordChangeStatus => {
  const reference = passwordLastUpdate ?? createdAt;
  if (!reference) {
    return "OK";
  }

  const months = differenceInMonths(now, new Date(reference));

  if (months >= PASSWORD_CHANGE_EXPIRED_MONTHS) {
    return "EXPIRED";
  }
  if (months >= PASSWORD_CHANGE_WARNING_MONTHS) {
    return "WARNING";
  }
  return "OK";
};

// Number of days past the renewal deadline (PASSWORD_CHANGE_WARNING_MONTHS
// after the last password change). Only meaningful once
// getPasswordChangeStatus returns "WARNING" or "EXPIRED" — 0 otherwise.
export const getPasswordChangeOverdueDays = (
  passwordLastUpdate: PasswordDateInput,
  createdAt: PasswordDateInput,
  now: Date = new Date()
): number => {
  const reference = passwordLastUpdate ?? createdAt;
  if (!reference) {
    return 0;
  }

  const deadline = addMonths(
    new Date(reference),
    PASSWORD_CHANGE_WARNING_MONTHS
  );
  const days = differenceInDays(now, deadline);

  return days > 0 ? days : 0;
};

// Date at which the password becomes EXPIRED. `expiredAfterMonths` defaults
// to PASSWORD_CHANGE_EXPIRED_MONTHS but can be overridden for accounts on a
// different renewal cycle.
export const getPasswordExpirationDate = (
  passwordLastUpdate: PasswordDateInput,
  createdAt: PasswordDateInput,
  expiredAfterMonths: number = PASSWORD_CHANGE_EXPIRED_MONTHS
): Date | null => {
  const reference = passwordLastUpdate ?? createdAt;
  if (!reference) {
    return null;
  }

  return addMonths(new Date(reference), expiredAfterMonths);
};
