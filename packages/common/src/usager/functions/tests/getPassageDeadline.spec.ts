import { subDays } from "date-fns";
import { USAGER_VALIDE_MOCK } from "../../../mocks";
import { getPassageDeadline } from "../getPassageDeadline";

describe("[getPassageDeadline] Display the passage deadline info", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-04-15T00:00:00.000Z"));
  });

  const buildUsager = (dateInteraction: Date | null) => ({
    ...USAGER_VALIDE_MOCK,
    decision: { ...USAGER_VALIDE_MOCK.decision, statut: "VALIDE" as const },
    lastInteraction: {
      ...USAGER_VALIDE_MOCK.lastInteraction,
      dateInteraction: dateInteraction as unknown as Date,
    },
  });

  it("No color: last passage 30 days ago", () => {
    const usager = buildUsager(subDays(new Date(), 30));
    const result = getPassageDeadline(usager);

    expect(result.isActive).toEqual(true);
    expect(result.daysSinceLastPassage).toEqual(30);
    expect(result.color).toBeNull();
  });

  it("No color yet: 60 days without passage (2 months complete, no extra day)", () => {
    const usager = buildUsager(subDays(new Date(), 60));

    expect(getPassageDeadline(usager).color).toBeNull();
  });

  it("Orange: 61 days without passage (2 months complete + 1 day)", () => {
    const usager = buildUsager(subDays(new Date(), 61));

    expect(getPassageDeadline(usager).color).toEqual("bg-warning");
  });

  it("No red yet: 90 days without passage (3 months complete, no extra day)", () => {
    const usager = buildUsager(subDays(new Date(), 90));

    expect(getPassageDeadline(usager).color).toEqual("bg-warning");
  });

  it("Red: 91 days without passage (3 months complete + 1 day)", () => {
    const usager = buildUsager(subDays(new Date(), 91));

    expect(getPassageDeadline(usager).color).toEqual("bg-danger");
  });

  it("Inactive: usager not VALIDE", () => {
    const usager = {
      ...buildUsager(subDays(new Date(), 200)),
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
