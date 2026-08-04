import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../modules/shared/services/auth.service";

// Guards /renouveler-mot-de-passe: only reachable right after a login
// attempt came back with CHANGE_PASSWORD_REQUIRED (see LoginFormComponent).
// A direct hit on the URL (no pending state) redirects back to login.
@Injectable({ providedIn: "root" })
export class PasswordRenewalGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  public canActivate(): boolean {
    if (this.authService.pendingPasswordChangeEmail) {
      return true;
    }

    this.router.navigate(["/connexion"]);
    return false;
  }
}
