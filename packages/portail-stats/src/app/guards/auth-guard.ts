import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { UserSupervisorRole } from "@domifa/common";
import { PortailStatsAuthService } from "../modules/auth/services/portail-stats-auth.service";
import { CustomToastService } from "../modules/shared/services";

@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(
    private readonly authService: PortailStatsAuthService,
    private readonly router: Router,
    private readonly toastService: CustomToastService
  ) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const allowedRoles = (route.data["roles"] as UserSupervisorRole[]) || [];

    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        if (!isAuth) {
          this.authService.logoutAndRedirect(state);
          return false;
        }

        if (allowedRoles.length === 0) {
          return true;
        }

        if (this.authService.currentUserValue !== null) {
          const userRole = this.authService.currentUserValue.role;

          if (allowedRoles.includes(userRole)) {
            return true;
          }

          this.toastService.error(
            "Vos droits ne vous permettent pas d'accéder à cette page"
          );
          this.router.navigate(["/stats"]);
        }

        return false;
      }),
      catchError(() => {
        this.authService.logoutAndRedirect(state);
        return of(false);
      })
    );
  }
}
