import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { UserStructureRole } from "@domifa/common";
import { AuthService, CustomToastService } from "../modules/shared/services";
@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastService: CustomToastService
  ) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const allowedRoles = (route.data["roles"] as UserStructureRole[]) || [];

    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        if (!isAuth) {
          this.authService.logout(state);
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
        this.authService.logout(state);
        return of(false);
      })
    );
  }
}
