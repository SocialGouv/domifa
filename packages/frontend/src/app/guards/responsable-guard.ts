import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { Observable } from "rxjs";

import { AuthService } from "../modules/shared/services/auth.service";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class ResponsableGuard implements CanActivate {
  constructor(
    public router: Router,
    public authService: AuthService,
    private notifService: ToastrService
  ) {}

  public canActivate(): Observable<boolean> | boolean {
    if (this.authService.currentUserValue !== null) {
      const role = this.authService.currentUserValue.role;
      if (role === "admin" || role === "responsable") {
        return true;
      }
    }
    this.notifService.error(
      "Vos droits ne vous permettent pas d'accéder à cette page"
    );
    this.router.navigate(["/manage"]);
    return false;
  }
}
