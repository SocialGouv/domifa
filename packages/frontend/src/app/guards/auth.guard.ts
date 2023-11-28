import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { AuthService } from "../modules/shared/services/auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(
    public router: Router,
    private readonly authService: AuthService
  ) {}

  public canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
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
      })
    );
  }
}
