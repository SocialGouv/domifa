import { async, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ToastrModule } from "ngx-toastr";
import { first } from "rxjs/operators";
import { JwtInterceptor } from "src/app/interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "src/app/interceptors/server-error.interceptor";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { AyantDroit } from "../interfaces/ayant-droit";
import { Doc } from "../interfaces/doc";
import { Entretien } from "../interfaces/entretien";
import { Rdv } from "../interfaces/rdv";
import { Usager } from "../interfaces/usager";
import { UsagerService } from "./usager.service";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("UsagerService", () => {
  let service: UsagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        FontAwesomeModule,
        RouterModule.forRoot([]),
        ToastrModule.forRoot({
          enableHtml: true,
          positionClass: "toast-top-full-width",
          preventDuplicates: true,
          progressAnimation: "increasing",
          progressBar: true,
          timeOut: 2000,
        }),
      ],
      providers: [
        UsagerService,
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: ServerErrorInterceptor,
        },
        {
          provide: MatomoInjector,
          useValue: {
            init: jest.fn(),
          },
        },
        {
          provide: MatomoTracker,
          useValue: {
            setUserId: jest.fn(),
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.get(UsagerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("Interfaces", () => {
    const usager = new Usager({});
    const entretien = new Entretien({});
    const rdv = new Rdv({});
    const doc = new Doc({});
    const today = new Date();
    today.setSeconds(0);
    today.setMilliseconds(0);

    expect(doc).toBeDefined();
    expect(usager).toBeDefined();
    expect(entretien).toBeDefined();
    expect(rdv).toBeDefined();

    const usagerFull = new Usager({
      dateNaissance: new Date("December 20, 1991 02:12:00"),
      id: 2,
      nom: "Test",
      prenom: "Tester",
      sexe: "homme",
      structure: "2",
      surnom: "Test Test",
      villeNaissance: "Saint-denis",
    });

    const rdvFull = new Rdv({
      dateRdv: new Date("December 20, 1991 02:12:00"),
      userId: 10,
      userName: "Domifa",
    });

    const docFull = new Doc({
      dateImport: new Date(),
      label: "A",
      filetype: "image/jpeg",
      importBy: "A",
    });
    expect(docFull).toEqual(docFull);

    const ayantDroit = new AyantDroit({
      dateNaissance: "20/12/1991",
      lien: "enfant",
      nom: "Le nom",
      prenom: "Le prénom",
    });

    expect(ayantDroit).toEqual({
      dateNaissance: "20/12/1991",
      lien: "enfant",
      nom: "Le nom",
      prenom: "Le prénom",
    });

    expect(rdvFull).toEqual({
      dateRdv: new Date("December 20, 1991 02:12:00"),
      heureRdv: { hour: 2, minute: 12 },
      isNow: true,
      jourRdv: {
        day: 20,
        month: 12,
        year: 1991,
      },
      userId: 10,
      userName: "Domifa",
    });
  });
});
