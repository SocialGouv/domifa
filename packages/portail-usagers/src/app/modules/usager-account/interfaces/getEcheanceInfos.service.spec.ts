import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks/USAGER_ACTIF.mock";
import { getEcheanceInfos } from "./getEcheanceInfos.service";
import { addDays, subDays } from "date-fns";

describe("[getEcheanceInfos] Affichage des infos de l'échéance ", () => {
  beforeAll(() => {
    // Date de réféce : 12 Février 2020
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2020-04-30T00:00:00.000Z"));
  });

  it("Domicilié Actif", () => {
    const usager = USAGER_ACTIF_MOCK;

    // On part d'aujourd'hui, on réduit les jours pour vérifier l'affichage
    // dateFin: new Date("2020-04-30"),
    const dateFinForTest = new Date();

    usager.decision.dateFin = new Date();
    // Domiciliation terminée aujourd'hui
    expect(getEcheanceInfos(usager)).toEqual({
      isActif: true,
      color: "bg-danger",
      dateToDisplay: new Date("2020-04-30T00:00:00.000Z"),
      dayBeforeEnd: 0,
    });

    // Domiciliation terminée 15 jours avant

    usager.decision.dateFin = subDays(dateFinForTest, 15);
    expect(getEcheanceInfos(usager)).toEqual({
      isActif: true,
      color: "bg-danger",
      dateToDisplay: new Date("2020-04-15T00:00:00.000Z"),
      dayBeforeEnd: -15,
    });

    // Domiciliation bientôt terminée
    usager.decision.dateFin = addDays(dateFinForTest, 25);
    expect(getEcheanceInfos(usager)).toEqual({
      isActif: true,
      color: "bg-warning",
      dateToDisplay: new Date("2020-05-25T00:00:00.000Z"),
      dayBeforeEnd: 25,
    });

    // Domiciliation bientôt terminée
    usager.decision.dateFin = addDays(dateFinForTest, 65);
    expect(getEcheanceInfos(usager)).toEqual({
      isActif: true,
      color: "d-none",
      dateToDisplay: new Date("2020-07-04T00:00:00.000Z"),
      dayBeforeEnd: 65,
    });
  });

  it("Renouvellements", () => {
    const usager = USAGER_ACTIF_MOCK;

    usager.decision.statut = "ATTENTE_DECISION";
    expect(getEcheanceInfos(usager).isActif).toEqual(true);

    usager.decision.statut = "INSTRUCTION";
    expect(getEcheanceInfos(usager).isActif).toEqual(true);
  });

  it("Instruction & Decision", () => {
    const usager = USAGER_ACTIF_MOCK;
    usager.typeDom = "PREMIERE_DOM";
    usager.decision.statut = "ATTENTE_DECISION";
    expect(getEcheanceInfos(usager).isActif).toEqual(false);
    expect(getEcheanceInfos(usager).color).toEqual("d-none");

    usager.decision.statut = "INSTRUCTION";
    expect(getEcheanceInfos(usager).isActif).toEqual(false);
    expect(getEcheanceInfos(usager).color).toEqual("d-none");
  });

  it("Autres status : refus radiés", () => {
    const usager = USAGER_ACTIF_MOCK;
    usager.decision.dateFin = new Date();

    usager.decision.statut = "REFUS";
    usager.decision.dateDebut = new Date("2020-02-02T00:00:00.000Z");
    usager.decision.dateFin = new Date("2020-02-02T00:00:00.000Z");

    expect(getEcheanceInfos(usager)).toEqual({
      isActif: false,
      dateToDisplay: new Date("2020-02-02T00:00:00.000Z"),
      dayBeforeEnd: 365,
      color: "d-none",
    });

    usager.decision.statut = "RADIE";

    expect(getEcheanceInfos(usager)).toEqual({
      isActif: false,
      dateToDisplay: new Date("2020-02-02T00:00:00.000Z"),
      dayBeforeEnd: 365,
      color: "d-none",
    });

    delete usager.decision;
    expect(getEcheanceInfos(usager)).toEqual({
      isActif: false,
      dateToDisplay: null,
      dayBeforeEnd: 365,
      color: "d-none",
    });
  });
});
