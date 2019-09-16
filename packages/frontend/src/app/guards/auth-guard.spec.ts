import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule, HttpHandler } from "@angular/common/http";
import { inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterModule,
  RouterStateSnapshot
} from "@angular/router";
import { AuthService } from "../services/auth.service";
import { AuthGuard } from "./auth-guard";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authService: AuthService;
  let activatedSnapshot: ActivatedRouteSnapshot;
  let routerSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      providers: [
        AuthGuard,
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            params: { id: 1 }
          }
        },
        {
          provide: RouterStateSnapshot,
          useValue: {
            params: { url: "/connexion" }
          }
        },
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" }
      ]
    });

    authService = TestBed.get(AuthService);
    authGuard = TestBed.get(AuthGuard);
    router = TestBed.get(Router);
    activatedSnapshot = TestBed.get(ActivatedRouteSnapshot);
    routerSnapshot = TestBed.get(RouterStateSnapshot);
  });

  it("should be created", inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  it("CanActivate", () => {
    authGuard = new AuthGuard(router, authService);
  });
});
