import { APP_BASE_HREF } from "@angular/common";
import { inject, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { PortailStatsAuthService } from "../modules/auth/services/portail-stats-auth.service";
import { RoleRedirectGuard } from "./redirect-guard";

describe("RoleRedirectGuard", () => {
  let guard: RoleRedirectGuard;
  let authService: PortailStatsAuthService;
  let router: Router;

  const mockRole = (role: string | null) => {
    Object.defineProperty(authService, "currentUserValue", {
      get: () => (role === null ? null : { role }),
      configurable: true,
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        RoleRedirectGuard,
        PortailStatsAuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
    });

    authService = TestBed.inject(PortailStatsAuthService);
    router = TestBed.inject(Router);
    guard = TestBed.inject(RoleRedirectGuard);
    jest.spyOn(router, "navigate").mockResolvedValue(true);
  });

  it("should be created", inject(
    [RoleRedirectGuard],
    (service: RoleRedirectGuard) => {
      expect(service).toBeTruthy();
    }
  ));

  it.each(["department", "region", "national", "super-admin-domifa"])(
    "should redirect %s to /stats",
    (role: string) => {
      mockRole(role);

      expect(guard.canActivate()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(["/stats"]);
    }
  );

  it("should redirect to auth/login when user is not logged in", () => {
    mockRole(null);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["auth/login"]);
  });

  it("should redirect unknown role to auth/login", () => {
    mockRole("unknown-role");

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["auth/login"]);
  });
});
