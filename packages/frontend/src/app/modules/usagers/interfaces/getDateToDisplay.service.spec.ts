import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks/USAGER_ACTIF.mock";
import { getDateToDisplay } from "./getDateToDisplay.service";

it("getDateToDisplay: Valide", () => {
  expect(getDateToDisplay(USAGER_ACTIF_MOCK).isActif).toEqual(true);

  USAGER_ACTIF_MOCK.decision.statut = "REFUS";
  expect(getDateToDisplay(USAGER_ACTIF_MOCK).isActif).toEqual(false);

  USAGER_ACTIF_MOCK.decision.statut = "RADIE";
  expect(getDateToDisplay(USAGER_ACTIF_MOCK).isActif).toEqual(false);

  delete USAGER_ACTIF_MOCK.decision;
  expect(getDateToDisplay(USAGER_ACTIF_MOCK).isActif).toEqual(false);
});
