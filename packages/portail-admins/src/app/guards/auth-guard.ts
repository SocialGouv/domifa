import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(private readonly authService: AdminAuthService) {}

  public canActivate(): Observable<boolean> {
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
        return true;
      }),
      catchError(() => {
        this.authService.logoutAndRedirect();
        return of(false);
      })
    );
  }
}
