import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

import { UsagerAuthService } from "../modules/usager-auth/services/usager-auth.service";

import { AuthGuard } from "./auth-guard";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authService: UsagerAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthGuard,
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            params: { id: 1 },
          },
        },
        {
          provide: RouterStateSnapshot,
          useValue: {
            params: { url: "/connexion" },
          },
        },
        UsagerAuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
    });

    authService = TestBed.inject(UsagerAuthService);
    authGuard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it("should be created", inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  it("CanActivate", () => {
    authGuard = new AuthGuard(router, authService);
    expect(authGuard).toBeTruthy();
  });
});
