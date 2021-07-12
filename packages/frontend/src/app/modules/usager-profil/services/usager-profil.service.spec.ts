import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { JwtInterceptor } from "../../../interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "../../../interceptors/server-error.interceptor";
import { AuthService } from "../../shared/services/auth.service";
import { UsagerService } from "../../usagers/services/usager.service";

import { UsagerProfilService } from "./usager-profil.service";

describe("UsagerProfilService", () => {
  let service: UsagerProfilService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        FontAwesomeModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
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
    service = TestBed.inject(UsagerProfilService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
