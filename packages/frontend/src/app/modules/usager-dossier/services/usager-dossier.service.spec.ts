import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { RouterTestingModule } from "@angular/router/testing";

import {
  UsagerFormModel,
  Entretien,
  Rdv,
} from "../../usager-shared/interfaces";
import { UsagerDossierService } from "./usager-dossier.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";

describe("UsagerDossierService", () => {
  let service: UsagerDossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(UsagerDossierService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("Classes construction", () => {
    const usager = new UsagerFormModel();
    const entretien = new Entretien({});
    const rdv = new Rdv();

    expect(usager).toBeDefined();
    expect(entretien).toBeDefined();
    expect(rdv).toBeDefined();

    const rdvFull = new Rdv({
      dateRdv: new Date("December 20, 2035 02:12:00"),
      userId: 10,
      userName: "DomiFa",
    });

    expect(rdvFull).toEqual({
      dateRdv: new Date("December 20, 2035 02:12:00"),
      heureRdv: "02:12",
      isNow: false,
      jourRdv: {
        day: 20,
        month: 12,
        year: 2035,
      },
      userId: 10,
      userName: "DomiFa",
    });
  });
});
