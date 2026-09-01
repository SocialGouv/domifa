import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { AuthService } from "../../../shared/services";
import { EditPasswordFormComponent } from "../edit-password-form/edit-password-form.component";

// Landing page after a login with an overdue password (see AuthGuard) —
// same pattern as AcceptCguComponent: a dedicated, single-purpose page the
// user can't route around, reusing the existing edit-my-password endpoint
// via EditPasswordFormComponent rather than a bespoke renewal flow.
@Component({
  selector: "app-renew-password",
  standalone: true,
  imports: [CommonModule, EditPasswordFormComponent],
  templateUrl: "./renew-password.component.html",
})
export class RenewPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly titleService = inject(Title);

  public ngOnInit(): void {
    this.titleService.setTitle("Renouvellement du mot de passe - DomiFa");
  }

  // The password-change endpoint terminates the current session server-side
  // (security policy) — the JWT we're holding is already invalid, so there's
  // nothing to refresh: just log out locally and send the user back to login.
  public onSuccess(): void {
    this.authService.logout();
  }

  public logout(): void {
    this.authService.logout();
  }
}
