import { isProcurationActifMaintenant, isTransfertActifMaintenant } from ".";
import { USAGER_ACTIF_MOCK } from "./../../../../_common/mocks/USAGER_ACTIF.mock";

describe("[getEcheanceInfos] Affichage des infos de l'échéance ", () => {
  beforeAll(() => {
    // Date de réféce : 12 Février 2020
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2020-04-30T00:00:00.000Z"));
  });

  it("Transfert Actif", () => {
    const usager = USAGER_ACTIF_MOCK;
    expect(isTransfertActifMaintenant(usager.options.transfert)).toBeFalsy();

    usager.options.transfert = {
      actif: true,
      dateDebut: new Date("2020-02-30T00:00:00.000Z"),
      dateFin: new Date("2020-03-30T00:00:00.000Z"),
    };
    expect(isTransfertActifMaintenant(usager.options.transfert)).toBeFalsy();

    usager.options.transfert = {
      actif: true,
      dateDebut: new Date("2020-02-30T00:00:00.000Z"),
      dateFin: new Date("2020-05-30T00:00:00.000Z"),
    };
    expect(isTransfertActifMaintenant(usager.options.transfert)).toBeTruthy();
  });

  it("Procu Actif", () => {
    const usager = USAGER_ACTIF_MOCK;
    expect(
      isProcurationActifMaintenant(usager.options.procuration)
    ).toBeFalsy();

    usager.options.procuration = {
      actif: true,
      dateDebut: new Date("2020-02-30T00:00:00.000Z"),
      dateFin: new Date("2020-03-30T00:00:00.000Z"),
    };
    expect(
      isProcurationActifMaintenant(usager.options.procuration)
    ).toBeFalsy();

    usager.options.procuration = {
      actif: true,
      dateDebut: new Date("2020-02-30T00:00:00.000Z"),
      dateFin: new Date("2020-05-30T00:00:00.000Z"),
    };
    expect(
      isProcurationActifMaintenant(usager.options.procuration)
    ).toBeTruthy();
  });
});
