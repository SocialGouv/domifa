import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { RouterTestingModule } from "@angular/router/testing";

import { MatomoInjector, MatomoTracker } from "ngx-matomo";

import { JwtInterceptor } from "src/app/interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "src/app/interceptors/server-error.interceptor";
import { AuthService } from "src/app/modules/shared/services/auth.service";

import { UsagerService } from "./usager.service";
import {
  UsagerFormModel,
  Entretien,
  Rdv,
} from "../../usager-shared/interfaces";
import { SharedModule } from "../../shared/shared.module";

describe("UsagerService", () => {
  let service: UsagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        SharedModule,
        RouterTestingModule,
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
    service = TestBed.inject(UsagerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("Interfaces", () => {
    const usager = new UsagerFormModel({});
    const entretien = new Entretien({});
    const rdv = new Rdv({});

    const today = new Date();
    today.setSeconds(0);
    today.setMilliseconds(0);

    expect(usager).toBeDefined();
    expect(entretien).toBeDefined();
    expect(rdv).toBeDefined();

    const rdvFull = new Rdv({
      dateRdv: new Date("December 20, 2033 02:12:00"),
      userId: 10,
      userName: "Domifa",
    });

    expect(rdvFull).toEqual({
      dateRdv: new Date("December 20, 2033 02:12:00"),
      heureRdv: "02:12",
      isNow: false,
      jourRdv: {
        day: 20,
        month: 12,
        year: 2033,
      },
      userId: 10,
      userName: "Domifa",
    });
  });

  it("Rendez-vous passé", () => {
    const rdvFull = new Rdv({
      dateRdv: new Date("October 12, 2019 15:05:00"),
      userId: 10,
      userName: "Domifa",
    });
    expect(rdvFull).toEqual({
      dateRdv: new Date("October 12, 2019 15:05:00"),
      heureRdv: "15:05",
      isNow: true,
      jourRdv: {
        day: 12,
        month: 10,
        year: 2019,
      },
      userId: 10,
      userName: "Domifa",
    });
  });
});
