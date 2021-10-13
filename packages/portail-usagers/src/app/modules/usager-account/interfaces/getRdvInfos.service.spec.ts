import { ETAPE_DECISION } from "./../../../../_common/model/usager/constants/ETAPES_DEMANDE.const";
import { ETAPE_RENDEZ_VOUS } from "../../../../_common/model/usager/constants/ETAPES_DEMANDE.const";

import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks/USAGER_ACTIF.mock";
import { getRdvInfos } from "./getRdvInfos.service";

describe("Création des rendez-vous", () => {
  beforeAll(() => {
    // Date de réféce : 20 Décembre 2020
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2020, 11, 20, 19, 20));
  });

  it("Rendez-vous dans le futur", () => {
    const usager = USAGER_ACTIF_MOCK;
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

    usager.rdv = undefined;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });
  });

  it("Rendez-vous dans le passé", () => {
    const usager = USAGER_ACTIF_MOCK;
    usager.rdv = {
      dateRdv: new Date(2020, 6, 20, 19, 20),
      userId: 1,
      userName: "name",
    };

    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    expect(getRdvInfos(usager)).toEqual({
      class: "text-danger",
      content: "RDV le 20/07/2020 à 19:20",
      display: true,
    });

    // RD
    usager.etapeDemande = ETAPE_DECISION;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "RDV le 20/07/2020 à 19:20",
      display: false,
    });
  });

  it("Rendez-vous de base", () => {
    const usager = USAGER_ACTIF_MOCK;
    usager.rdv = { dateRdv: null, userId: 0, userName: "" };
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    usager.rdv.dateRdv = undefined;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    usager.rdv = undefined;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    expect(getRdvInfos(undefined)).toEqual({
      class: "",
      content: "",
      display: false,
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
