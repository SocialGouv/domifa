import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../_common/mocks";
import { JwtInterceptor } from "../../../interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "../../../interceptors/server-error.interceptor";
import { AuthService } from "../../shared/services";
import { SharedModule } from "../../shared/shared.module";
import {
  UsagerFormModel,
  Entretien,
  Rdv,
} from "../../usager-shared/interfaces";
import { ManageUsagersService } from "./manage-usagers.service";

describe("ManageUsagersService", () => {
  let service: ManageUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        SharedModule,
        RouterTestingModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
      ],
      providers: [
        ManageUsagersService,
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
    service = TestBed.inject(ManageUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("Interfaces", () => {
    const usager = new UsagerFormModel();
    const entretien = new Entretien();
    const rdv = new Rdv();

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
