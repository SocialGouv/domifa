import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { UsagerAuthService } from "../modules/usager-auth/services/usager-auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(private readonly authService: UsagerAuthService) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        if (!isAuth) {
          this.authService.logoutAndRedirect(state);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.authService.logoutAndRedirect(state);
        return of(false);
      }),
    );
  }
}
