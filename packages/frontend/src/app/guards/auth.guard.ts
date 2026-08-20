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
import { hasAcceptedCurrentCgu } from "../shared/constants";

const ACCEPT_CGU_PATH = "/accepter-cgu";

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

        const currentUser = this.authService.currentUserValue;
        const isOnAcceptCguPage = state.url.startsWith(ACCEPT_CGU_PATH);

        if (
          currentUser !== null &&
          !currentUser.supportMode &&
          !hasAcceptedCurrentCgu(currentUser.acceptTerms) &&
          !isOnAcceptCguPage
        ) {
          this.router.navigate([ACCEPT_CGU_PATH], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }

        if (allowedRoles.length === 0) {
          return true;
        }

        if (currentUser !== null) {
          if (allowedRoles.includes(currentUser.role)) {
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
