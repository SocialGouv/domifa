import { addDays, subDays } from "date-fns";
import { USAGER_VALIDE_MOCK } from "../../../mocks";
import { getEcheanceInfo } from "../getEcheanceInfo";
import { Usager } from "../../interfaces";

describe("[getEcheanceInfo] Affichage des infos de l'échéance ", () => {
  beforeAll(() => {
    // Date de référence : 12 Février 2020

    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-04-30T00:00:00.000Z"));
  });

  it("Domicilié Actif", () => {
    const usager = USAGER_VALIDE_MOCK;

    // On part d'aujourd'hui, on réduit les jours pour vérifier l'affichage
    // dateFin: new Date("2020-04-30"),
    const dateFinForTest = new Date();

    usager.decision.dateFin = new Date();
    // Domiciliation terminée aujourd'hui
    expect(getEcheanceInfo(usager)).toEqual({
      isActif: true,
      color: "bg-danger",
      dateToDisplay: new Date("2020-04-30T00:00:00.000Z"),
      dayBeforeEnd: 0,
    });

    // Domiciliation terminée 15 jours avant

    usager.decision.dateFin = subDays(dateFinForTest, 15);
    expect(getEcheanceInfo(usager)).toEqual({
      isActif: true,
      color: "bg-danger",
      dateToDisplay: new Date("2020-04-15T00:00:00.000Z"),
      dayBeforeEnd: -15,
    });

    // Domiciliation bientôt terminée
    usager.decision.dateFin = addDays(dateFinForTest, 25);
    expect(getEcheanceInfo(usager)).toEqual({
      isActif: true,
      color: "bg-warning",
      dateToDisplay: new Date("2020-05-25T00:00:00.000Z"),
      dayBeforeEnd: 25,
    });

    // Domiciliation bientôt terminée
    usager.decision.dateFin = addDays(dateFinForTest, 65);
    expect(getEcheanceInfo(usager)).toEqual({
      isActif: true,
      color: "d-none",
      dateToDisplay: new Date("2020-07-04T00:00:00.000Z"),
      dayBeforeEnd: 65,
    });
  });

  it("Renouvellements", () => {
    const usager = USAGER_VALIDE_MOCK;

    usager.decision.statut = "ATTENTE_DECISION";
    expect(getEcheanceInfo(usager).isActif).toEqual(true);

    usager.decision.statut = "INSTRUCTION";
    expect(getEcheanceInfo(usager).isActif).toEqual(true);
  });

  it("Instruction & Decision", () => {
    const usager = USAGER_VALIDE_MOCK;
    usager.typeDom = "PREMIERE_DOM";
    usager.decision.statut = "ATTENTE_DECISION";
    expect(getEcheanceInfo(usager).isActif).toEqual(false);
    expect(getEcheanceInfo(usager).color).toEqual("d-none");

    usager.decision.statut = "INSTRUCTION";
    expect(getEcheanceInfo(usager).isActif).toEqual(false);
    expect(getEcheanceInfo(usager).color).toEqual("d-none");
  });

  it("Autres status : refus radiés", () => {
    const usager = USAGER_VALIDE_MOCK;
    usager.decision.dateFin = new Date();

    usager.decision.statut = "REFUS";
    usager.decision.dateDebut = new Date("2020-02-02T00:00:00.000Z");
    usager.decision.dateFin = new Date("2020-02-02T00:00:00.000Z");

    expect(getEcheanceInfo(usager)).toEqual({
      isActif: false,
      dateToDisplay: new Date("2020-02-02T00:00:00.000Z"),
      dayBeforeEnd: 365,
      color: "d-none",
    });

    usager.decision.statut = "RADIE";

    expect(getEcheanceInfo(usager)).toEqual({
      isActif: false,
      dateToDisplay: new Date("2020-02-02T00:00:00.000Z"),
      dayBeforeEnd: 365,
      color: "d-none",
    });

    expect(
      getEcheanceInfo({
        historique: usager.historique,
        typeDom: usager.typeDom,
      } as unknown as Usager)
    ).toEqual({
      isActif: false,
      dateToDisplay: null,
      dayBeforeEnd: 365,
      color: "d-none",
    });
  });
});
