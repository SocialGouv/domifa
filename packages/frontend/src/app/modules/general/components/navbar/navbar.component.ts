import { Component, Input, OnInit } from "@angular/core";

import { MatomoTracker } from "@ngx-matomo/tracker";
import { environment } from "../../../../../environments/environment";
import { UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  public isNavbarCollapsed: boolean;
  public matomoInfo: boolean;
  public today = new Date();

  public portailAdminUrl = environment.portailAdminUrl;

  @Input() public pendingNews: boolean;
  @Input() public me: UserStructure | null;

  constructor(
    private readonly authService: AuthService,
    public matomoService: MatomoTracker
  ) {
    this.isNavbarCollapsed = false;
    this.matomoInfo = false;
  }

  public ngOnInit(): void {
    this.initMatomo();
  }

  public initMatomo(): void {
    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";
    this.matomoService.setUserId("0");
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public logout(): void {
    this.authService.logout();
  }
}
