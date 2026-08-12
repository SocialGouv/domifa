import { USAGER_VALIDE_MOCK } from "../../../mocks";
import { getPassageDeadline } from "../getPassageDeadline";

describe("[getPassageDeadline] Display the passage deadline info", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    // Fixed mid-month "today" to avoid month-length edge effects.
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

  it("No color: last passage less than 2 months ago", () => {
    const usager = buildUsager(new Date("2020-03-15T00:00:00.000Z"));
    const result = getPassageDeadline(usager);

    expect(result.isActive).toEqual(true);
    expect(result.color).toBeNull();
  });

  it("No color yet: exactly 2 months complete, without the extra day", () => {
    const usager = buildUsager(new Date("2020-02-15T00:00:00.000Z"));

    expect(getPassageDeadline(usager).color).toBeNull();
  });

  it("Orange: 2 months complete + 1 day without passage", () => {
    const usager = buildUsager(new Date("2020-02-14T00:00:00.000Z"));

    expect(getPassageDeadline(usager).color).toEqual("bg-warning");
  });

  it("No red yet: exactly 3 months complete, without the extra day", () => {
    const usager = buildUsager(new Date("2020-01-15T00:00:00.000Z"));

    expect(getPassageDeadline(usager).color).toEqual("bg-warning");
  });

  it("Red: 3 months complete + 1 day without passage", () => {
    const usager = buildUsager(new Date("2020-01-14T00:00:00.000Z"));

    expect(getPassageDeadline(usager).color).toEqual("bg-danger");
  });

  it("Inactive: usager not VALIDE", () => {
    const usager = {
      ...buildUsager(new Date("2019-01-01T00:00:00.000Z")),
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
