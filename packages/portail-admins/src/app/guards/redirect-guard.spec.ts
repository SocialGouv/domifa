import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { inject, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterModule } from "@angular/router";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";
import { RoleRedirectGuard } from "./redirect-guard";

describe("RoleRedirectGuard", () => {
  let guard: RoleRedirectGuard;
  let authService: AdminAuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterModule],
      providers: [
        RoleRedirectGuard,
        AdminAuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
    });

    authService = TestBed.inject(AdminAuthService);
    router = TestBed.inject(Router);
    guard = TestBed.inject(RoleRedirectGuard);
  });

  it("should be created", inject(
    [RoleRedirectGuard],
    (service: RoleRedirectGuard) => {
      expect(service).toBeTruthy();
    }
  ));

  it("should redirect super-admin-domifa to /structures", () => {
    jest.spyOn(router, "navigate");
    Object.defineProperty(authService, "currentUserValue", {
      get: () => ({ role: "super-admin-domifa" }),
      configurable: true,
    });

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["/structures"]);
  });

  it("should redirect department role to /stats", () => {
    jest.spyOn(router, "navigate");
    Object.defineProperty(authService, "currentUserValue", {
      get: () => ({ role: "department" }),
      configurable: true,
    });

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["/stats"]);
  });

  it("should redirect region role to /stats", () => {
    jest.spyOn(router, "navigate");
    Object.defineProperty(authService, "currentUserValue", {
      get: () => ({ role: "region" }),
      configurable: true,
    });

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["/stats"]);
  });

  it("should redirect national role to /stats", () => {
    jest.spyOn(router, "navigate");
    Object.defineProperty(authService, "currentUserValue", {
      get: () => ({ role: "national" }),
      configurable: true,
    });

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["/stats"]);
  });

  it("should redirect to auth/login when user is not logged in", () => {
    jest.spyOn(router, "navigate");
    Object.defineProperty(authService, "currentUserValue", {
      get: () => null,
      configurable: true,
    });

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["auth/login"]);
  });

  it("CanActivate", () => {
    guard = new RoleRedirectGuard(authService, router);
    expect(guard).toBeTruthy();
  });
});
