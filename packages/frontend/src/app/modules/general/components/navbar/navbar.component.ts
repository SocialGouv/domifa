import { Component, Input } from "@angular/core";

import { MatomoTracker } from "ngx-matomo-client";
import { environment } from "../../../../../environments/environment";

import { AuthService } from "../../../shared/services/auth.service";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
  public matomoInfo: boolean;

  public readonly portailAdminUrl = environment.portailAdminUrl;

  @Input() public pendingNews!: boolean;
  @Input() public me!: UserStructure | null;

  constructor(
    private readonly authService: AuthService,
    public readonly matomoService: MatomoTracker
  ) {
    this.matomoInfo = false;
    this.initMatomo();
  }

  public initMatomo(): void {
    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public logout(): void {
    this.authService.logoutFromBackend();
  }
}
