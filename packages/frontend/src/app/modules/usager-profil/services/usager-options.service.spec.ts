import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { JwtInterceptor } from "../../../interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "../../../interceptors/server-error.interceptor";
import { AuthService } from "../../shared/services/auth.service";
import { UsagerService } from "../../usagers/services";

import { UsagerOptionsService } from "./usager-options.service";

describe("UsagerOptionsService", () => {
  let service: UsagerOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CommonModule, RouterTestingModule],
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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(UsagerOptionsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
