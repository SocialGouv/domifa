import { ETAPE_RENDEZ_VOUS } from "../../../../_common/usager/constants";
import { DEFAULT_USAGER } from "./../../../../_common/mocks/DEFAULT_USAGER.const";

import { getRdvInfos } from "./getRdvInfos.service";

describe("Création des rendez-vous", () => {
  beforeAll(() => {
    // Date de réféce : 20 Décembre 2020
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2020, 11, 20, 19, 20));
  });

  it("Rendez-vous dans le futur", () => {
    const usager = DEFAULT_USAGER;
    usager.rdv = {
      dateRdv: new Date(2021, 2, 20, 19, 20),
      userId: 1,
      userName: "name",
    };

    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "RDV le 20/03/2021 à 19:20",
      display: true,
    });
  });

  it("Rendez-vous dans le passé", () => {
    const usager = DEFAULT_USAGER;
    usager.rdv = {
      dateRdv: new Date(2020, 6, 20, 19, 20),
      userId: 1,
      userName: "name",
    };

    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "RDV le 20/07/2020 à 19:20",
      display: false,
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
