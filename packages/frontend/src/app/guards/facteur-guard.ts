import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { Observable } from "rxjs";

import { AuthService } from "../modules/shared/services/auth.service";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class FacteurGuard implements CanActivate {
  constructor(
    public router: Router,
    private authService: AuthService,
    private notifService: ToastrService
  ) {}

  public canActivate(): Observable<boolean> | boolean {
    const role = this.authService.currentUserValue.role;

    if (role !== "admin" && role !== "instructeur") {
      this.notifService.error(
        "Vos droits ne vous permettent pas d'accéder à cette page"
      );
      this.router.navigate(["/manage"]);
      return false;
    }
    return true;
  }
}
