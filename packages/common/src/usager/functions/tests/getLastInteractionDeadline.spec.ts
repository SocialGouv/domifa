import { subDays, subMonths } from "date-fns";
import { USAGER_VALIDE_MOCK } from "../../../mocks";
import { getLastInteractionDeadline } from "../getLastInteractionDeadline";

describe("[getLastInteractionDeadline] Display the last interaction deadline info", () => {
  const buildUsager = (dateInteraction: Date | null) => ({
    ...USAGER_VALIDE_MOCK,
    decision: { ...USAGER_VALIDE_MOCK.decision, statut: "VALIDE" as const },
    lastInteraction: {
      ...USAGER_VALIDE_MOCK.lastInteraction,
      dateInteraction: dateInteraction as unknown as Date,
    },
  });

  it("No color: last passage a few days ago", () => {
    const usager = buildUsager(subDays(new Date(), 2));
    const result = getLastInteractionDeadline(usager);

    expect(result.isActive).toEqual(true);
    expect(result.color).toBeNull();
  });

  it("No color: last passage exactly two months ago", () => {
    const usager = buildUsager(subMonths(new Date(), 2));

    expect(getLastInteractionDeadline(usager).color).toBeNull();
  });

  it("Orange: last passage more than two months ago (PREVIOUS_TWO_MONTHS)", () => {
    const usager = buildUsager(subDays(subMonths(new Date(), 2), 3));

    expect(getLastInteractionDeadline(usager).color).toEqual("bg-warning");
  });

  it("No red yet: last passage exactly three months ago", () => {
    const usager = buildUsager(subMonths(new Date(), 3));

    expect(getLastInteractionDeadline(usager).color).toEqual("bg-warning");
  });

  it("Red: last passage more than three months ago (PREVIOUS_THREE_MONTHS)", () => {
    const usager = buildUsager(subMonths(new Date(), 6));

    expect(getLastInteractionDeadline(usager).color).toEqual("bg-danger");
  });

  it("Inactive: usager not VALIDE", () => {
    const usager = {
      ...buildUsager(subMonths(new Date(), 6)),
      decision: { ...USAGER_VALIDE_MOCK.decision, statut: "RADIE" as const },
    };

    expect(getLastInteractionDeadline(usager)).toEqual({
      isActive: false,
      dateToDisplay: null,
      daysSinceLastPassage: 0,
      color: null,
    });
  });

  it("Inactive: no last interaction date", () => {
    const usager = buildUsager(null);

    expect(getLastInteractionDeadline(usager).isActive).toEqual(false);
  });

  describe("Timezone sensitivity (documented limitation, not fixed by this ticket)", () => {
    it("the same instant can fall on a different calendar day depending on the timezone", () => {
      // `usager.lastInteraction.dateInteraction`, once it has gone through the API,
      // is always a UTC ISO string (Date#toJSON), so `new Date(...)` always
      // reconstructs the same absolute instant regardless of where it runs:
      // parsing is timezone-safe, in jsonb columns as much as in timestamptz ones.
      //
      // What is NOT timezone-safe is the day-boundary arithmetic that follows
      // (endOfDay/subMonths/subDays, used both here and in getDecisionDeadline/
      // getUsagerDeadlines): it relies on the *ambient* local timezone of
      // whichever machine executes it. This function runs client-side, in the
      // structure's own browser, so a structure in Cayenne (America/Cayenne,
      // UTC-3) can land on a different calendar day than a mainland-France
      // structure (Europe/Paris, UTC+1/+2) for the exact same instant.
      //
      // Concrete, independently-reproducible example: for
      // now = 2024-03-01T01:00:00.000Z and lastPassage = 2023-12-30T12:00:00.000Z,
      // getLastInteractionDeadline(...) resolves to "bg-warning" when the process
      // runs under TZ=Europe/Paris (or TZ=UTC), but to `null` (no badge at all)
      // under TZ=America/Cayenne — same usager, same instant, different pastille.
      // Reproduce with:
      //   TZ=Europe/Paris pnpm --filter @domifa/common test -- getLastInteractionDeadline
      //   TZ=America/Cayenne pnpm --filter @domifa/common test -- getLastInteractionDeadline
      // (Jest does not honour a `process.env.TZ` mutation made *during* a test
      // run, so this can't be asserted as a single in-process test — it has to
      // be set before the process starts.)
      const instant = new Date("2024-01-01T01:00:00.000Z");
      const localCalendarDayIn = (timeZone: string) =>
        new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(instant);

      expect(localCalendarDayIn("Europe/Paris")).toEqual("2024-01-01");
      expect(localCalendarDayIn("America/Cayenne")).toEqual("2023-12-31");
    });
  });
});
