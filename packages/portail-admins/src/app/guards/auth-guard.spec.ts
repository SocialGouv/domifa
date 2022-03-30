import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterModule,
  RouterStateSnapshot,
} from "@angular/router";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";
import { AuthGuard } from "./auth-guard";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authService: AdminAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,

        RouterModule.forRoot([], { relativeLinkResolution: "legacy" }),
      ],
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
