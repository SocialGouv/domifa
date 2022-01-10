import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { Observable } from "rxjs";

import { AuthService } from "../modules/shared/services/auth.service";
import { CustomToastService } from "../modules/shared/services/custom-toast.service";

@Injectable({ providedIn: "root" })
export class CanEditSmsGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: CustomToastService
  ) {}

  public canActivate(): Observable<boolean> | boolean {
    if (this.authService.currentUserValue !== null) {
      if (this.authService.currentUserValue.structure.sms.enabledByDomifa) {
        return true;
      } else {
        this.toastService.error(
          "L'accès aux SMS n'est pas encore ouvert à votre structure"
        );
        this.router.navigate(["/manage"]);
        return false;
      }
    }
    this.toastService.error(
      "Vos droits ne vous permettent pas d'accéder à cette page"
    );
    this.router.navigate(["/manage"]);
    return false;
  }
}
