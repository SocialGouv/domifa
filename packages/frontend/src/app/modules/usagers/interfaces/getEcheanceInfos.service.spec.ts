import moment from "moment";
import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks/USAGER_ACTIF.mock";
import { getEcheanceInfos } from "./getEcheanceInfos.service";

describe("getEcheanceInfos", () => {
  it("Test des status", () => {
    const usager = USAGER_ACTIF_MOCK;
    expect(getEcheanceInfos(usager).isActif).toEqual(true);

    usager.decision.statut = "REFUS";
    expect(getEcheanceInfos(usager).isActif).toEqual(false);

    usager.decision.statut = "RADIE";
    expect(getEcheanceInfos(usager).isActif).toEqual(false);

    usager.decision.statut = "ATTENTE_DECISION";
    expect(getEcheanceInfos(usager).isActif).toEqual(true);

    usager.decision.typeDom = "RENOUVELLEMENT";
    expect(getEcheanceInfos(usager).isActif).toEqual(true);

    delete usager.decision;
    expect(getEcheanceInfos(usager).isActif).toEqual(false);

    expect(getEcheanceInfos(usager)).toEqual({
      isActif: false,
      dateToDisplay: null,
      dayBeforeEnd: 365,
    });
  });
});
