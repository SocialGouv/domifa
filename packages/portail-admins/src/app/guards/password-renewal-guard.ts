import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";

// Guards /auth/renouveler-mot-de-passe: only reachable right after a login
// attempt came back with CHANGE_PASSWORD_REQUIRED (see AdminLoginComponent).
// A direct hit on the URL (no pending state) redirects back to login.
@Injectable({ providedIn: "root" })
export class PasswordRenewalGuard {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly router: Router
  ) {}

  public canActivate(): boolean {
    if (this.authService.pendingPasswordChangeEmail) {
      return true;
    }

    this.router.navigate(["/auth/login"]);
    return false;
  }
}
