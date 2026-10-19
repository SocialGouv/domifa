import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { getPasswordChangeStatus, UserStructureRole } from "@domifa/common";
import { AuthService, CustomToastService } from "../modules/shared/services";
import { hasAcceptedCurrentCgu } from "../shared/constants";

const ACCEPT_CGU_PATH = "/accepter-cgu";
const RENEW_PASSWORD_PATH = "/renouveler-mot-de-passe";

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
        if (currentUser === null) {
          return false;
        }

        // Each of these two pages is itself guarded by AuthGuard — a user
        // who fails BOTH checks must not be bounced between them (every
        // redirect re-runs the guard, so a bare "am I on my own page?"
        // check on each side is not enough: while on /accepter-cgu the
        // password check would still fire and send them to
        // /renouveler-mot-de-passe, whose own CGU check would then send
        // them right back — an infinite loop that floods /structures/auth/me).
        const isOnAcceptCguPage = state.url.startsWith(ACCEPT_CGU_PATH);
        const isOnRenewPasswordPage = state.url.startsWith(RENEW_PASSWORD_PATH);
        const isOnBlockingPage = isOnAcceptCguPage || isOnRenewPasswordPage;

        if (
          !hasAcceptedCurrentCgu(currentUser.acceptTerms) &&
          !isOnBlockingPage
        ) {
          this.router.navigate([ACCEPT_CGU_PATH], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }

        if (
          getPasswordChangeStatus(
            currentUser.passwordLastUpdate,
            currentUser.createdAt
          ) === "EXPIRED" &&
          !isOnBlockingPage
        ) {
          this.router.navigate([RENEW_PASSWORD_PATH], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }

        if (allowedRoles.length === 0) {
          return true;
        }

        if (allowedRoles.includes(currentUser.role)) {
          return true;
        }

        this.toastService.error(
          "Vos droits ne vous permettent pas d'accéder à cette page"
        );
        this.router.navigate(["/manage"]);
        return false;
      }),
      catchError(() => {
        this.authService.logout(state);
        return of(false);
      })
    );
  }
}
