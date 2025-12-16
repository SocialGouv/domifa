import { Component, Input } from "@angular/core";
import { UserStructure } from "@domifa/common";
import { AuthService } from "../../../../../shared/services";
/**
 * Login modal menu for mobile and easy access buttons
 */

@Component({
  selector: "app-login-modal-menu",
  templateUrl: "./login-modal-menu.component.html",
})
export class LoginModalMenuComponent {
  @Input() me: UserStructure | null;

  constructor(private readonly authService: AuthService) {}

  public logout() {
    this.authService.logoutFromBackend();
  }
}
