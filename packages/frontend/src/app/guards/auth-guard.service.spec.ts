import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule, HttpHandler } from "@angular/common/http";
import { inject, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { AuthGuardService } from "./auth-guard.service";

describe("AuthGuardService", () => {
  let authGuard: AuthGuardService;
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      providers: [
        AuthGuardService,
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" }
      ]
    });

    authService = TestBed.get(AuthService);
    authGuard = TestBed.get(AuthGuardService);
    router = TestBed.get(Router);
  });

  it("should be created", inject(
    [AuthGuardService],
    (service: AuthGuardService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("CanActivate", () => {
    authService.isAuth = true;
    authGuard = new AuthGuardService(authService, router);
    expect(authGuard.canActivate()).toEqual(true);
  });
});
