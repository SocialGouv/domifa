import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AppUser } from "../../_common/model";
import { AuthService } from "../modules/shared/services/auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(public router: Router, private authService: AuthService) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.me().pipe(
      map((user: AppUser) => {
        if (user !== null) {
          return true;
        }
        this.authService.logoutAndRedirect(state.url);
        return false;
      })
    );
  }
}
