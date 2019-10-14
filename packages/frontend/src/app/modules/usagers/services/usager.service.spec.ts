import { async, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { first } from "rxjs/operators";
import { JwtInterceptor } from "src/app/interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "src/app/interceptors/server-error.interceptor";
import { AuthService } from "src/app/services/auth.service";
import { AyantDroit } from "../interfaces/ayant-droit";
import { Doc } from "../interfaces/document";
import { Entretien } from "../interfaces/entretien";
import { LastInteraction } from "../interfaces/last-interaction";
import { Rdv } from "../interfaces/rdv";
import { Usager } from "../interfaces/usager";
import { UsagerService } from "./usager.service";

describe("UsagerService", () => {
  let service: UsagerService;
  let authService: AuthService;

  beforeAll(async done => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      providers: [
        UsagerService,
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: ServerErrorInterceptor
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    service = TestBed.get(UsagerService);
    authService = TestBed.get(AuthService);

    authService
      .login("ccastest@yopmail.com", "Azerty012345")
      .pipe(first())
      .subscribe(
        user => {
          done();
        },
        error => {
          done();
        }
      );
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("Doublon & Get usager", async(() => {
    const rdv = new Rdv({
      dateRdv: "2019-07-30T23:25:44.980Z",
      heureRdv: { hour: 10, minute: 20 },
      isNow: "oui",
      jourRdv: { day: 31, month: 7, year: 2019 },
      userId: 2
    });

    service.createRdv(rdv, 1).subscribe((usager: Usager) => {
      expect(usager.rdv.userName).toEqual("Juste Isabelle");
    });

    service.findOne(1).subscribe((usager: Usager) => {
      expect(usager.prenom).toEqual("Marta");
    });

    service.isDoublon("Ram", "Marta").subscribe((doublons: any) => {
      expect(doublons.length).toEqual(1);
    });
  }));

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
        agent: null,
        ayantsDroits: [],
        ayantsDroitsExist: false,
        dateNaissance: "1991-12-20T01:12:00.000Z",
        dateNaissancePicker: {
          day: 20,
          month: 12,
          year: 1991
        },
        decision: {
          agent: "",
          dateDecision: new Date(usagerFull.decision.dateDecision),
          motif: "",
          motifDetails: "",
          orientation: "",
          orientationDetails: "",
          statut: "instruction",
          userId: 0,
          userName: ""
        },
        docs: [],
        email: null,
        entretien: {
          accompagnement: null,
          accompagnementDetail: null,
          cause: null,
          causeDetail: null,
          commentaires: null,
          domiciliation: false,
          liencommune: null,
          raison: null,
          raisonDetail: null,
          residence: null,
          residenceDetail: null,
          revenus: false
        },
        etapeDemande: 0,
        historique: null,
        id: 2,
        lastInteraction: {
          appel: null,
          courrierIn: null,
          courrierOut: null,
          nbCourrier: 0,
          recommandeIn: null,
          recommandeOut: null,
          visite: null
        },
        nom: "Test",
        phone: null,
        preference: {
          aucun: false,
          email: false,
          phone: false
        },
        prenom: "Tester",
        rdv: {
          dateRdv: new Date(usagerFull.rdv.dateRdv),
          heureRdv: {
            hour: 10,
            minute: 20
          },
          isNow: "",
          jourRdv: {
            day: 28,
            month: 6,
            year: 2019
          },
          userId: null,
          userName: null
        },
        sexe: "homme",
        structure: 2,
        surnom: "Test Test",
        villeNaissance: "Saint-denis"
      })
    );

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
