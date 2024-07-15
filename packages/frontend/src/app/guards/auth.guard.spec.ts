import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterModule,
  RouterStateSnapshot,
} from "@angular/router";

import { AuthService } from "../modules/shared/services/auth.service";
import { AuthGuard } from "./auth.guard";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../shared";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
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
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
    });

    authService = TestBed.inject(AuthService);
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
