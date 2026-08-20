import { subDays, subMonths } from "date-fns";
import { USAGER_VALIDE_MOCK } from "../../../mocks";
import { getPassageDeadline } from "../getPassageDeadline";

describe("[getPassageDeadline] Display the passage deadline info", () => {
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
    const result = getPassageDeadline(usager);

    expect(result.isActive).toEqual(true);
    expect(result.color).toBeNull();
  });

  it("No color: last passage exactly two months ago", () => {
    const usager = buildUsager(subMonths(new Date(), 2));

    expect(getPassageDeadline(usager).color).toBeNull();
  });

  it("Orange: last passage more than two months ago (PREVIOUS_TWO_MONTHS)", () => {
    const usager = buildUsager(subDays(subMonths(new Date(), 2), 3));

    expect(getPassageDeadline(usager).color).toEqual("bg-warning");
  });

  it("No red yet: last passage exactly three months ago", () => {
    const usager = buildUsager(subMonths(new Date(), 3));

    expect(getPassageDeadline(usager).color).toEqual("bg-warning");
  });

  it("Red: last passage more than three months ago (PREVIOUS_THREE_MONTHS)", () => {
    const usager = buildUsager(subMonths(new Date(), 6));

    expect(getPassageDeadline(usager).color).toEqual("bg-danger");
  });

  it("Inactive: usager not VALIDE", () => {
    const usager = {
      ...buildUsager(subMonths(new Date(), 6)),
      decision: { ...USAGER_VALIDE_MOCK.decision, statut: "RADIE" as const },
    };

    expect(getPassageDeadline(usager)).toEqual({
      isActive: false,
      dateToDisplay: null,
      daysSinceLastPassage: 0,
      color: null,
    });
  });

  it("Inactive: no last interaction date", () => {
    const usager = buildUsager(null);

    expect(getPassageDeadline(usager).isActive).toEqual(false);
  });
});
