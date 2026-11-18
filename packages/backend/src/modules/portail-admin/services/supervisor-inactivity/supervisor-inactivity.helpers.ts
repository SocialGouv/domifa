import { subMonths } from "date-fns";
import { UserSupervisorRole } from "@domifa/common";

// Retention defined in the AIPD for pilotage accounts (DGCS/DREETS/DDETS):
// a reminder is sent after 17 months without login, the account is deleted
// after 18 months. Structure accounts follow their own (manual) process.
export const SUPERVISOR_INACTIVITY_REMINDER_MONTHS = 17;
export const SUPERVISOR_INACTIVITY_DELETION_MONTHS = 18;
// Minimum delay between the reminder and the deletion, so that an account
// already inactive for more than 18 months still gets a full month notice.
export const SUPERVISOR_INACTIVITY_NOTICE_MONTHS =
  SUPERVISOR_INACTIVITY_DELETION_MONTHS - SUPERVISOR_INACTIVITY_REMINDER_MONTHS;

// DGCS = national, DREETS = region, DDETS = department.
// super-admin-domifa accounts are never deleted automatically.
export const SUPERVISOR_INACTIVITY_ROLES: UserSupervisorRole[] = [
  "national",
  "region",
  "department",
];

export type SupervisorInactivityCandidate = {
  lastLogin: Date | null;
  createdAt?: Date;
  // Last AUTO_INACTIVITY_REMINDER_USER_SUPERVISOR log of the user
  lastReminderAt: Date | null;
};

export type SupervisorInactivityAction = "REMIND" | "DELETE" | null;

export function getInactivityReferenceDate(
  user: Pick<SupervisorInactivityCandidate, "lastLogin" | "createdAt">
): Date {
  // createdAt is always set in database; the fallback only keeps an
  // incomplete row out of the deletion flow.
  return new Date(user.lastLogin ?? user.createdAt ?? Date.now());
}

export function getSupervisorInactivityAction(
  user: SupervisorInactivityCandidate,
  now: Date = new Date()
): SupervisorInactivityAction {
  const reference = getInactivityReferenceDate(user);
  if (reference > subMonths(now, SUPERVISOR_INACTIVITY_REMINDER_MONTHS)) {
    return null;
  }

  // A reminder sent before the last login belongs to a previous period of
  // inactivity and does not count.
  const reminder = user.lastReminderAt ? new Date(user.lastReminderAt) : null;
  if (!reminder || reminder < reference) {
    return "REMIND";
  }

  if (
    reference <= subMonths(now, SUPERVISOR_INACTIVITY_DELETION_MONTHS) &&
    reminder <= subMonths(now, SUPERVISOR_INACTIVITY_NOTICE_MONTHS)
  ) {
    return "DELETE";
  }
  return null;
}

// Date shown in the reminder email: 18 months after the reference date, and
// never earlier than one month after the reminder.
export function getScheduledDeletionDate(
  user: Pick<SupervisorInactivityCandidate, "lastLogin" | "createdAt">,
  reminderDate: Date
): Date {
  const byInactivity = subMonths(
    getInactivityReferenceDate(user),
    -SUPERVISOR_INACTIVITY_DELETION_MONTHS
  );
  const byNotice = subMonths(
    reminderDate,
    -SUPERVISOR_INACTIVITY_NOTICE_MONTHS
  );
  return byInactivity > byNotice ? byInactivity : byNotice;
}
