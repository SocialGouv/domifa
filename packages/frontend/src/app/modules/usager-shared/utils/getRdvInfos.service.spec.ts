import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks";
import {
  ETAPE_RENDEZ_VOUS,
  ETAPE_DECISION,
  UsagerRdv,
  ETAPE_DOSSIER_COMPLET,
} from "@domifa/common";
import { getRdvInfos } from "./getRdvInfos.service";

beforeAll(() => {
  jest.useFakeTimers();
  // Date de référence : 20 Décembre 2020
  jest.setSystemTime(new Date(2020, 11, 20, 19, 20));
});

describe("Création des rendez-vous", () => {
  it("Rendez-vous dans le futur : affichage warning", () => {
    const usager = USAGER_ACTIF_MOCK;
    usager.rdv = {
      dateRdv: new Date(2021, 2, 20, 19, 20),
      userId: 1,
      userName: "name",
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
    const usager = USAGER_ACTIF_MOCK;
    usager.rdv = {
      dateRdv: new Date(2020, 6, 20, 19, 20),
      userId: 1,
      userName: "name",
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
    const usager = USAGER_ACTIF_MOCK;
    usager.rdv = { dateRdv: null, userId: 0, userName: "" };
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    usager.rdv.dateRdv = null as Date;
    expect(getRdvInfos(usager)).toEqual({
      class: "",
      content: "",
      display: false,
    });

    usager.rdv = undefined as UsagerRdv;
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
