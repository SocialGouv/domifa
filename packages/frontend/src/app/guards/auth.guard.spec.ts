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
import { CustomToastService } from "../modules/shared/services/custom-toast.service";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authService: AuthService;
  let toastr: CustomToastService;

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
    toastr = TestBed.inject(CustomToastService);
    router = TestBed.inject(Router);
  });

  it("should be created", inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  it("CanActivate", () => {
    authGuard = new AuthGuard(authService, router, toastr);
    expect(authGuard).toBeTruthy();
  });
});
