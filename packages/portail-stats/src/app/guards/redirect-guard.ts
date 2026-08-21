import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { PortailStatsAuthService } from "../modules/auth/services/portail-stats-auth.service";

@Injectable({ providedIn: "root" })
export class RoleRedirectGuard {
  constructor(
    private readonly authService: PortailStatsAuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    const role = this.authService.currentUserValue?.role;
    switch (role) {
      case "department":
      case "region":
      case "national":
      case "super-admin-domifa":
        this.router.navigate(["/stats"]);
        break;
      default:
        this.router.navigate(["auth/login"]);
        break;
    }

    return false;
  }
}
