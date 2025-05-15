import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { RouterModule } from "@angular/router";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";
import { AuthGuard } from "./auth-guard";
import { CustomToastService } from "../modules/shared/services";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;

  let authService: AdminAuthService;
  let router: Router;
  let routerService: RouterStateSnapshot;
  let toastService: CustomToastService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterModule],
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
        AdminAuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
    });

    authService = TestBed.inject(AdminAuthService);
    router = TestBed.inject(Router);
    toastService = TestBed.inject(CustomToastService);
    authGuard = TestBed.inject(AuthGuard);
    routerService = TestBed.inject(RouterStateSnapshot);
  });

  it("should be created", inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  it("CanActivate", () => {
    authGuard = new AuthGuard(authService, router, toastService, routerService);
    expect(authGuard).toBeTruthy();
  });
});
