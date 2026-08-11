import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { EditPasswordFormComponent } from "../edit-password-form/edit-password-form.component";

// Landing page after a login with an overdue password (see AuthGuard) — same
// pattern as the structures app: a dedicated, single-purpose page reusing
// the existing edit-my-password endpoint via EditPasswordFormComponent.
@Component({
  selector: "app-renew-password",
  templateUrl: "./renew-password.component.html",
  imports: [CommonModule, EditPasswordFormComponent],
})
export class RenewPasswordComponent implements OnInit {
  private readonly authService = inject(AdminAuthService);
  private readonly titleService = inject(Title);

  public ngOnInit(): void {
    this.titleService.setTitle("Renouvellement du mot de passe - Admin DomiFa");
  }

  // The password-change endpoint terminates the current session server-side
  // (security policy) — the JWT we're holding is already invalid, so there's
  // nothing to refresh: just log out locally and send the user back to login.
  public onSuccess(): void {
    this.authService.logoutAndRedirect();
  }

  public logout(): void {
    this.authService.logoutAndRedirect();
  }
}
