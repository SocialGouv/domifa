import {
  USAGER_VALIDE_MOCK,
  USAGER_REFUS_MOCK,
} from "../../../../_common/mocks";
import { setUsagerInformation } from "../setUsagerInformation";

describe("setUsagerInformation", () => {
  describe("Should clean default values", () => {
    const result = setUsagerInformation({ ...USAGER_VALIDE_MOCK });
    expect(result.historique.length).toEqual(0);
    expect(result.entretien).toBeNull();
    expect(result.rdv).toBeNull();
  });
  describe("Should complete 'statusInfo'", () => {
    it("Should complete 'statusInfo' for 'VALIDE'", () => {
      const result = setUsagerInformation({ ...USAGER_VALIDE_MOCK });
      expect(result.statusInfo.text).toEqual("Actif");
      expect(result.statusInfo.color).toEqual("green-status");
    });

    it("Should complete 'statusInfo' for 'REFUS'", () => {
      const result = setUsagerInformation({ ...USAGER_REFUS_MOCK });
      expect(result.statusInfo.text).toEqual("Refusé");
      expect(result.statusInfo.color).toEqual("red-status");
    });
  });

  describe("statusInfo", () => {
    it("Should complete 'statusInfo' for 'VALIDE': dateToDisplay is 'dateFin'", () => {
      const result = setUsagerInformation({ ...USAGER_VALIDE_MOCK });
      expect(result.echeanceInfos.isActif).toEqual(true);
      expect(result.echeanceInfos.color).toEqual("bg-danger");
      expect(result.echeanceInfos.dateToDisplay).toEqual(
        USAGER_VALIDE_MOCK.decision.dateFin
      );
    });

    it("Should complete 'statusInfo' for 'REFUS': dateToDisplay is 'dateDebut'", () => {
      const result = setUsagerInformation({ ...USAGER_REFUS_MOCK });
      expect(result.echeanceInfos.isActif).toEqual(false);
      expect(result.echeanceInfos.color).toEqual("d-none");
      expect(result.echeanceInfos.dateToDisplay).toEqual(
        USAGER_REFUS_MOCK.decision.dateDebut
      );
    });
  });

  describe("totalInteractionsEnAttente", () => {
    it("totalInteractionsEnAttente 'VALIDE'", () => {
      const result = setUsagerInformation({ ...USAGER_VALIDE_MOCK });
      expect(result.totalInteractionsEnAttente).toEqual(10);
    });
    it("totalInteractionsEnAttente 'REFUS'", () => {
      const result = setUsagerInformation({ ...USAGER_REFUS_MOCK });
      expect(result.totalInteractionsEnAttente).toEqual(0);
    });
  });
});
