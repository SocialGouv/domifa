import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { PortailAdminUser } from "@domifa/common";
import { format } from "date-fns";

import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { EditPasswordFormComponent } from "../edit-password-form/edit-password-form.component";

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  imports: [CommonModule, EditPasswordFormComponent],
})
export class MyAccountComponent implements OnInit {
  public me: PortailAdminUser | null;

  public editPassword: boolean;

  public get lastPasswordUpdate(): string {
    return this.me?.passwordLastUpdate
      ? "Dernière modification: " +
          format(new Date(this.me.passwordLastUpdate), "dd/MM/yyyy")
      : "Aucune modification de mot de passe enregistrée";
  }

  constructor(
    private readonly authService: AdminAuthService,
    private readonly titleService: Title
  ) {
    this.editPassword = false;
    this.me = null;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Mon compte - Admin DomiFa");

    this.me = this.authService.currentUserValue;
  }

  public openPasswordForm(): void {
    this.editPassword = true;
  }

  // The password-change endpoint terminates the current session server-side
  // (security policy) — the JWT we're holding is already invalid, so there's
  // nothing to refresh: log out and send the user back to login.
  public onPasswordChanged(): void {
    this.authService.logoutAndRedirect();
  }

  public onPasswordCancel(): void {
    this.editPassword = false;
  }
}
