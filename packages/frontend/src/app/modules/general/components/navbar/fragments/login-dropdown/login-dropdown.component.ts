import { Component, Input } from "@angular/core";

import { UserStructure } from "@domifa/common";
import { AuthService } from "../../../../../shared/services";
import { MatomoTracker } from "ngx-matomo-client";
/**
 * Login dropdown elements for desktop and easy access buttons
 */

@Component({
  selector: "app-login-dropdown",
  templateUrl: "./login-dropdown.component.html",
})
export class LoginDropdownComponent {
  @Input() me: UserStructure | null;
  constructor(
    private readonly authService: AuthService,
    public readonly matomoService: MatomoTracker
  ) {}

  public logout(): void {
    this.authService.logoutFromBackend();
  }
}
