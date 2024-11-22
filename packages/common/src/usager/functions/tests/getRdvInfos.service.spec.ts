import { USAGER_VALIDE_MOCK } from "../../../mocks";
import {
  ETAPE_RENDEZ_VOUS,
  ETAPE_DOSSIER_COMPLET,
  ETAPE_DECISION,
} from "../../constants";

import { getRdvInfos } from "../getRdvInfos.service";

beforeAll(() => {
  jest.useFakeTimers();
  // Date de référence : 20 Décembre 2020
  jest.setSystemTime(new Date(2020, 11, 20, 19, 20));
});

describe("Création des rendez-vous", () => {
  it("Rendez-vous dans le futur : affichage warning", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usager = {
      etapeDemande: 4,
      rdv: {
        dateRdv: new Date(2021, 2, 20, 19, 20),
        userId: 1,
        userName: "name",
      },
    };

    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    expect(getRdvInfos(usager)).toEqual({
      class: "warning",
      content: "20 mars 2021 à 19:20",
      display: true,
    });

    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });
  });

  it("Rendez-vous dans le passé", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const usager = {
      rdv: {
        dateRdv: new Date(2020, 6, 20, 19, 20),
        userId: 1,
        userName: "name",
      },
      etapeDemande: 1,
    };

    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    expect(getRdvInfos(usager)).toEqual({
      class: "danger",
      content: "20 juillet 2020 à 19:20",
      display: true,
    });

    usager.etapeDemande = ETAPE_DECISION;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });
  });

  it("Rendez-vous de base", () => {
    const usager = USAGER_VALIDE_MOCK;
    usager.rdv = { dateRdv: null, userId: 0, userName: "" };
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    usager.rdv.dateRdv = null;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usager.rdv = null as any;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    expect(getRdvInfos()).toEqual({
      class: "",
      content: "",
      display: false,
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
