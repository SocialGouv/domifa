import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { UsagerAuthService } from "../modules/usager-auth/services/usager-auth.service";

@Injectable({ providedIn: "root" })
export class LoggedGuard {
  constructor(
    private readonly router: Router,
    private readonly authService: UsagerAuthService,
  ) {}

  public canActivate(): Observable<boolean> {
    if (this.authService.currentUserValue === null) {
      return of(true);
    }

    return this.authService.isAuth().pipe(
      map((isAuth: boolean) => {
        if (isAuth) {
          this.router.navigate(["/account"]);
          return false;
        }
        return true;
      }),
    );
  }
}
