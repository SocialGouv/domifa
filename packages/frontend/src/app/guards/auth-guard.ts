import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "../modules/shared/services/auth.service";
import { User } from "../modules/users/interfaces/user";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.authService.me().pipe(
      map((user: User) => {
        return true;
      }),
      catchError((err: any) => {
        this.router.navigate(["/connexion"], {
          queryParams: { returnUrl: state.url },
        });
        return of(false);
      })
    );
  }
}
