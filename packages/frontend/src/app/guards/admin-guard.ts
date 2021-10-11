import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { AuthService } from "../modules/shared/services/auth.service";

@Injectable({ providedIn: "root" })
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private notifService: ToastrService
  ) {}

  public canActivate(): Observable<boolean> | boolean {
    if (this.authService.currentUserValue !== null) {
      const role = this.authService.currentUserValue.role;
      if (role === "admin") {
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
