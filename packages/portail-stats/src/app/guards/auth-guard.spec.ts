import { APP_BASE_HREF } from "@angular/common";
import { inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { PortailStatsAuthService } from "../modules/auth/services/portail-stats-auth.service";
import { CustomToastService } from "../modules/shared/services";
import { AuthGuard } from "./auth-guard";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;

  let authService: PortailStatsAuthService;
  let router: Router;
  let toastService: CustomToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
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
        PortailStatsAuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
    });

    authService = TestBed.inject(PortailStatsAuthService);
    router = TestBed.inject(Router);
    toastService = TestBed.inject(CustomToastService);
    authGuard = TestBed.inject(AuthGuard);
  });

  it("should be created", inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  it("CanActivate", () => {
    authGuard = new AuthGuard(authService, router, toastService);
    expect(authGuard).toBeTruthy();
  });
});
