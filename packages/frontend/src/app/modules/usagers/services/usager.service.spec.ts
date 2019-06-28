import { TestBed } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { AyantDroit } from "../interfaces/ayant-droit";
import { Doc } from "../interfaces/document";
import { Entretien } from "../interfaces/entretien";
import { LastInteraction } from "../interfaces/last-interaction";
import { Rdv } from "../interfaces/rdv";
import { Usager } from "../interfaces/usager";
import { UsagerService } from "./usager.service";

describe("UsagerService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [UsagerService]
    });
  });

  it("should be created", () => {
    const service: UsagerService = TestBed.get(UsagerService);
    expect(service).toBeTruthy();
  });

  it("Interfaces", () => {
    const usager = new Usager({});
    const entretien = new Entretien({});
    const rdv = new Rdv({});
    const lastInteraction = new LastInteraction({});
    const doc = new Doc({});
    const today = new Date();
    today.setSeconds(0);
    today.setMilliseconds(0);

    expect(doc).toBeDefined();
    expect(usager).toBeDefined();
    expect(entretien).toBeDefined();
    expect(rdv).toBeDefined();
    expect(lastInteraction).toBeDefined();

    const usagerFull = new Usager({
      dateNaissance: new Date("December 20, 1991 02:12:00"),
      id: 2,
      nom: "Test",
      prenom: "Tester",
      sexe: "homme",
      structure: "2",
      surnom: "Test Test",
      villeNaissance: "Saint-denis"
    });

    const rdvFull = new Rdv({
      dateRdv: new Date("December 20, 1991 02:12:00"),
      userId: 10,
      userName: "Domifa"
    });
    const lastInteractionFull = new LastInteraction({
      appel: new Date(),
      courrierIn: new Date(),
      courrierOut: new Date(),
      nbCourrier: 90,
      recommandeIn: new Date(),
      recommandeOut: new Date(),
      visite: new Date()
    });

    const docFull = new Doc({
      dateImport: new Date(),
      documentName: "A",
      filetype: "image/jpeg",
      importBy: "A"
    });
    expect(docFull).toEqual(docFull);

    const ayantDroit = new AyantDroit({
      dateNaissance: "20/12/1991",
      lien: "enfant",
      nom: "Le nom",
      prenom: "Le prénom"
    });

    expect(ayantDroit).toEqual({
      dateNaissance: "20/12/1991",
      lien: "enfant",
      nom: "Le nom",
      prenom: "Le prénom"
    });

    const usagerToTest = JSON.parse(JSON.stringify(usagerFull));
    const usagerTestVariable = JSON.parse(
      JSON.stringify({
        id: 2,
        nom: "Test",
        prenom: "Tester",
        surnom: "Test Test",
        sexe: "homme",
        dateNaissance: "1991-12-20T01:12:00.000Z",
        dateNaissancePicker: { day: 20, month: 12, year: 1991 },
        villeNaissance: "Saint-denis",
        email: null,
        phone: null,
        docs: [],
        agent: null,
        structure: 2,
        etapeDemande: 0,
        historique: null,
        rdv: {
          dateRdv: new Date(usagerFull.rdv.dateRdv),
          jourRdv: { day: 28, month: 6, year: 2019 },
          heureRdv: { hour: 10, minute: 20 },
          userId: null,
          userName: null,
          isNow: ""
        },
        lastInteraction: {
          nbCourrier: 0,
          courrierIn: null,
          courrierOut: null,
          recommandeIn: null,
          recommandeOut: null,
          appel: null,
          visite: null
        },
        entretien: {
          domiciliation: false,
          revenus: false,
          liencommune: null,
          residence: null,
          residenceDetail: null,
          cause: null,
          causeDetail: null,
          raison: null,
          raisonDetail: null,
          accompagnement: null,
          accompagnementDetail: null,
          commentaires: null
        },
        ayantsDroitsExist: false,
        ayantsDroits: [],
        preference: { aucun: false, email: false, phone: false },
        decision: {
          agent: "",
          dateInstruction: new Date(usagerFull.decision.dateInstruction),
          statut: "instruction",
          motif: "",
          userDecisionId: "",
          userDecisionName: "",
          userInstructionId: "",
          userInstructionName: "",
          userId: "",
          motifDetails: "",
          orientation: "",
          orientationDetails: ""
        }
      })
    );

    expect(usagerToTest).toMatchObject(usagerTestVariable);

    expect(rdvFull).toEqual({
      dateRdv: new Date("December 20, 1991 02:12:00"),
      heureRdv: { hour: 2, minute: 12 },
      isNow: "oui",
      jourRdv: {
        day: 20,
        month: 12,
        year: 1991
      },
      userId: 10,
      userName: "Domifa"
    });
    expect(lastInteractionFull).toBeDefined();
  });
});
