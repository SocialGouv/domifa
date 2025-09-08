import { APP_BASE_HREF } from "@angular/common";
import { inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  RouterModule,
  RouterStateSnapshot,
} from "@angular/router";

import { UsagerAuthService } from "../modules/usager-auth/services/usager-auth.service";

import { AuthGuard } from "./auth-guard";
import { provideHttpClient } from "@angular/common/http";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let authService: UsagerAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [
        AuthGuard,
        provideHttpClient(),
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
  });

  it("should be created", inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  it("CanActivate", () => {
    authGuard = new AuthGuard(authService);
    expect(authGuard).toBeTruthy();
  });
});
