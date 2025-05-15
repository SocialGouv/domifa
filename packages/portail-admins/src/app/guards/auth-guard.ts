import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";
import { Router, ActivatedRouteSnapshot } from "@angular/router";
import { UserSupervisorRole } from "@domifa/common";
import { CustomToastService } from "../modules/shared/services";
@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly router: Router,
    private readonly toastService: CustomToastService
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles = (route.data["roles"] as UserSupervisorRole[]) || [];

    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        if (!isAuth) {
          const redirectToAfterLogin =
            window.location.pathname + window.location.search;
          this.authService.logoutAndRedirect({
            redirectToAfterLogin,
          });
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
          this.router.navigate(["/manage"]);
        }

        return false;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }
}
