import { Component, Input, OnDestroy, OnInit } from "@angular/core";

import { MatomoTracker } from "ngx-matomo-client";
import { Subscription } from "rxjs";
import { environment } from "../../../../../environments/environment";

import { AuthService } from "../../../shared/services/auth.service";
import { WelcomeService } from "../../services/welcome.service";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public matomoInfo: boolean;

  public readonly portailAdminUrl = environment.portailAdminUrl;

  public pendingNews = false;
  @Input() public me!: UserStructure | null;

  private readonly subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    public readonly matomoService: MatomoTracker,
    private readonly welcomeService: WelcomeService
  ) {
    this.matomoInfo = false;
    this.initMatomo();
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.welcomeService.pendingNews$.subscribe({
        next: (pending) => {
          this.pendingNews = pending;
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
