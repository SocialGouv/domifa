import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { AuthService } from "../modules/shared/services/auth.service";

@Injectable({ providedIn: "root" })
export class LoggedGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.authService.currentUserValue === null) {
      return of(true);
    }

    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        return !isAuth;
      })
    );
  }
}
