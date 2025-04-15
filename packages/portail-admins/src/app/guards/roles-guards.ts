import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
import { CustomToastService } from "../modules/shared/services/custom-toast.service";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";
import { UserSupervisorRole } from "@domifa/common";

@Injectable({ providedIn: "root" })
export class RolesGuard {
  constructor(
    private readonly router: Router,
    private readonly authService: AdminAuthService,
    private readonly toastService: CustomToastService
  ) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const allowedRoles = route.data["roles"] as UserSupervisorRole[];

    if (!allowedRoles || allowedRoles.length === 0) {
      console.warn("RolesGuard: No roles specified for route", state.url);
      return false;
    }

    if (this.authService.currentUserValue !== null) {
      const userRole = this.authService.currentUserValue.role;

      if (allowedRoles.includes(userRole)) {
        return true;
      }
    }

    this.toastService.error(
      "Vos droits ne vous permettent pas d'accéder à cette page"
    );
    this.router.navigate(["/manage"]);
    return false;
  }
}
