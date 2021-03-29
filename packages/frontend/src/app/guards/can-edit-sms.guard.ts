import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { Observable } from "rxjs";

import { AuthService } from "../modules/shared/services/auth.service";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class CanEditSmsGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private notifService: ToastrService
  ) {}

  public canActivate(): Observable<boolean> | boolean {
    if (this.authService.currentUserValue !== null) {
      if (this.authService.currentUserValue.structure.sms.enabledByDomifa) {
        return true;
      } else {
        this.notifService.error(
          "L'accès aux SMS n'est pas encore ouvert à votre structure"
        );
        this.router.navigate(["/manage"]);
        return false;
      }
    }
    this.notifService.error(
      "Vos droits ne vous permettent pas d'accéder à cette page"
    );
    this.router.navigate(["/manage"]);
    return false;
  }
}
