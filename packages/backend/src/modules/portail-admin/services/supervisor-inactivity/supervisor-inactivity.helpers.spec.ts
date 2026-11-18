import { subDays, subMonths } from "date-fns";
import {
  getScheduledDeletionDate,
  getSupervisorInactivityAction,
} from "./supervisor-inactivity.helpers";

const NOW = new Date("2026-11-18T10:00:00.000Z");
const monthsAgo = (months: number, days = 0): Date =>
  subDays(subMonths(NOW, months), days);

describe("getSupervisorInactivityAction", () => {
  it("does nothing before 17 months of inactivity", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: monthsAgo(16, 25),
          createdAt: monthsAgo(30),
          lastReminderAt: null,
        },
        NOW
      )
    ).toBeNull();
  });

  it("reminds at 17 months of inactivity", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: monthsAgo(17),
          createdAt: monthsAgo(30),
          lastReminderAt: null,
        },
        NOW
      )
    ).toEqual("REMIND");
  });

  it("uses the creation date when the user never logged in", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: null,
          createdAt: monthsAgo(17, 1),
          lastReminderAt: null,
        },
        NOW
      )
    ).toEqual("REMIND");
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: null,
          createdAt: monthsAgo(3),
          lastReminderAt: null,
        },
        NOW
      )
    ).toBeNull();
  });

  it("does not remind twice", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: monthsAgo(17, 10),
          createdAt: monthsAgo(30),
          lastReminderAt: monthsAgo(0, 10),
        },
        NOW
      )
    ).toBeNull();
  });

  it("deletes at 18 months once the reminder was sent a month ago", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: monthsAgo(18),
          createdAt: monthsAgo(30),
          lastReminderAt: monthsAgo(1),
        },
        NOW
      )
    ).toEqual("DELETE");
  });

  it("never deletes without a reminder, even after 18 months", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: monthsAgo(24),
          createdAt: monthsAgo(30),
          lastReminderAt: null,
        },
        NOW
      )
    ).toEqual("REMIND");
  });

  it("waits one month after a late reminder before deleting", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: monthsAgo(24),
          createdAt: monthsAgo(30),
          lastReminderAt: monthsAgo(0, 15),
        },
        NOW
      )
    ).toBeNull();
  });

  it("ignores a reminder sent before the last login", () => {
    expect(
      getSupervisorInactivityAction(
        {
          lastLogin: monthsAgo(17, 2),
          createdAt: monthsAgo(40),
          lastReminderAt: monthsAgo(18),
        },
        NOW
      )
    ).toEqual("REMIND");
  });
});

describe("getScheduledDeletionDate", () => {
  it("is 18 months after the last login", () => {
    expect(
      getScheduledDeletionDate(
        { lastLogin: monthsAgo(17), createdAt: monthsAgo(30) },
        NOW
      )
    ).toEqual(monthsAgo(-1));
  });

  it("is at least one month after the reminder", () => {
    expect(
      getScheduledDeletionDate(
        { lastLogin: monthsAgo(24), createdAt: monthsAgo(30) },
        NOW
      )
    ).toEqual(monthsAgo(-1));
  });
});
