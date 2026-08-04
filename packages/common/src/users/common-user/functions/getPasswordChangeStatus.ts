import { addMonths, differenceInDays, differenceInMonths } from "date-fns";

export type PasswordChangeStatus = "OK" | "WARNING" | "EXPIRED";

const PASSWORD_CHANGE_WARNING_MONTHS = 11;
const PASSWORD_CHANGE_EXPIRED_MONTHS = 12;

export const getPasswordChangeStatus = (
  passwordLastUpdate: Date | string | null | undefined,
  createdAt: Date | string | null | undefined,
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

// Number of days past the renewal deadline (11 months after the last
// password change). Only meaningful once getPasswordChangeStatus returns
// "WARNING" or "EXPIRED" — 0 otherwise.
export const getPasswordChangeOverdueDays = (
  passwordLastUpdate: Date | string | null | undefined,
  createdAt: Date | string | null | undefined,
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
