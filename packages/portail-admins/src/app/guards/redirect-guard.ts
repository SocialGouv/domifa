import { Injectable } from "@angular/core";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class RoleRedirectGuard {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    const role = this.authService.currentUserValue?.role;
    switch (role) {
      case undefined:
        this.router.navigate(["auth/login"]);
        break;
      case "department":
      case "region":
      case "national":
        this.router.navigate(["/stats"]);
        break;
      case "super-admin-domifa":
        this.router.navigate(["/structures"]);
        break;
      default:
        this.router.navigate(["auth/login"]);
        break;
    }

    return false;
  }
}
