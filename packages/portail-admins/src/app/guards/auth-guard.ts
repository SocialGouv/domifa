import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(public router: Router, private authService: AdminAuthService) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        if (!isAuth) {
          const redirectToAfterLogin =
            window.location.pathname + window.location.search;
          this.authService.logoutAndRedirect(state, {
            redirectToAfterLogin,
          });
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.authService.logoutAndRedirect(state);
        return of(false);
      })
    );
  }
}
