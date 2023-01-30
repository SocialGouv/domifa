import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { CustomToastService } from "../modules/shared/services/custom-toast.service";

import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { AuthService } from "../modules/shared/services/auth.service";

@Injectable({ providedIn: "root" })
export class LoggedGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: CustomToastService
  ) {}

  public canActivate(): Observable<boolean> {
    if (this.authService.currentUserValue === null) {
      return of(true);
    }

    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        if (isAuth) {
          this.toastService.error(
            "Vous êtes déjà connecté, impossible d'accéder à cette page"
          );
          this.router.navigate(["/manage"]);
          return false;
        }
        return true;
      })
    );
  }
}
