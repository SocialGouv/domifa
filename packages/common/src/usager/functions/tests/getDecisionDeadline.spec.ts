import { addDays, subDays } from "date-fns";
import { USAGER_VALIDE_MOCK } from "../../../mocks";
import { getDecisionDeadline } from "../getDecisionDeadline";
import { Usager } from "../../interfaces";

describe("[getDecisionDeadline] Display the decision deadline info", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-04-30T00:00:00.000Z"));
  });

  it("Active usager", () => {
    const usager = USAGER_VALIDE_MOCK;

    const dateFinForTest = new Date();

    // Ending today: NOT overdue, still active until D+1
    usager.decision.dateFin = new Date();
    expect(getDecisionDeadline(usager)).toEqual({
      isActive: true,
      color: "bg-danger",
      dateToDisplay: new Date("2020-04-30T00:00:00.000Z"),
      daysBeforeEnd: 0,
    });

    // Ended 15 days ago
    usager.decision.dateFin = subDays(dateFinForTest, 15);
    expect(getDecisionDeadline(usager)).toEqual({
      isActive: true,
      color: "bg-danger",
      dateToDisplay: new Date("2020-04-15T00:00:00.000Z"),
      daysBeforeEnd: -15,
    });

    // Ending in 25 days
    usager.decision.dateFin = addDays(dateFinForTest, 25);
    expect(getDecisionDeadline(usager)).toEqual({
      isActive: true,
      color: "bg-warning",
      dateToDisplay: new Date("2020-05-25T00:00:00.000Z"),
      daysBeforeEnd: 25,
    });

    // Ending in 65 days
    usager.decision.dateFin = addDays(dateFinForTest, 65);
    expect(getDecisionDeadline(usager)).toEqual({
      isActive: true,
      color: "d-none",
      dateToDisplay: new Date("2020-07-04T00:00:00.000Z"),
      daysBeforeEnd: 65,
    });
  });

  it("Renewals", () => {
    const usager = USAGER_VALIDE_MOCK;

    usager.decision.statut = "ATTENTE_DECISION";
    expect(getDecisionDeadline(usager).isActive).toEqual(true);

    usager.decision.statut = "INSTRUCTION";
    expect(getDecisionDeadline(usager).isActive).toEqual(true);
  });

  it("Instruction & Decision", () => {
    const usager = USAGER_VALIDE_MOCK;
    usager.typeDom = "PREMIERE_DOM";
    usager.decision.statut = "ATTENTE_DECISION";
    expect(getDecisionDeadline(usager).isActive).toEqual(false);
    expect(getDecisionDeadline(usager).color).toEqual("d-none");

    usager.decision.statut = "INSTRUCTION";
    expect(getDecisionDeadline(usager).isActive).toEqual(false);
    expect(getDecisionDeadline(usager).color).toEqual("d-none");
  });

  it("Other statuses: refus, radies", () => {
    const usager = USAGER_VALIDE_MOCK;
    usager.decision.dateFin = new Date();

    usager.decision.statut = "REFUS";
    usager.decision.dateDebut = new Date("2020-02-02T00:00:00.000Z");
    usager.decision.dateFin = new Date("2020-02-02T00:00:00.000Z");

    expect(getDecisionDeadline(usager)).toEqual({
      isActive: false,
      dateToDisplay: new Date("2020-02-02T00:00:00.000Z"),
      daysBeforeEnd: 365,
      color: "d-none",
    });

    usager.decision.statut = "RADIE";

    expect(getDecisionDeadline(usager)).toEqual({
      isActive: false,
      dateToDisplay: new Date("2020-02-02T00:00:00.000Z"),
      daysBeforeEnd: 365,
      color: "d-none",
    });

    expect(
      getDecisionDeadline({
        historique: usager.historique,
        typeDom: usager.typeDom,
      } as unknown as Usager)
    ).toEqual({
      isActive: false,
      dateToDisplay: null,
      daysBeforeEnd: 365,
      color: "d-none",
    });
  });
});
