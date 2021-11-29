import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { RouterTestingModule } from "@angular/router/testing";

import { ToastrModule } from "ngx-toastr";
import { JwtInterceptor } from "src/app/interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "src/app/interceptors/server-error.interceptor";
import { AuthService } from "../../shared/services/auth.service";

import {
  UsagerFormModel,
  Entretien,
  Rdv,
} from "../../usager-shared/interfaces";
import { UsagerService } from "../../usagers/services/usager.service";

describe("UsagerService", () => {
  let service: UsagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: ServerErrorInterceptor,
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
      dateRdv: new Date("December 20, 1991 02:12:00"),
      userId: 10,
      userName: "Domifa",
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
