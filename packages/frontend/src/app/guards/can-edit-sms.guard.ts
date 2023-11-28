import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../modules/shared/services/auth.service";
import { CustomToastService } from "../modules/shared/services/custom-toast.service";

@Injectable({ providedIn: "root" })
export class CanEditSmsGuard {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastService: CustomToastService
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
