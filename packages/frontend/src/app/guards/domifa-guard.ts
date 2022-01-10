import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "../modules/shared/services/auth.service";

@Injectable({ providedIn: "root" })
export class DomifaGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  public canActivate(): Observable<boolean> | boolean {
    return this.authService.isDomifa().pipe(
      map((canAccess: boolean) => {
        return canAccess;
      }),
      catchError(() => {
        this.authService.logoutAndRedirect();
        return of(false);
      })
    );
  }
  xR;
}
