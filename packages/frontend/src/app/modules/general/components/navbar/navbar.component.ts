import { Component, OnInit } from "@angular/core";

import { MatomoTracker } from "ngx-matomo";
import { environment } from "../../../../../environments/environment";
import { UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import DOMIFA_NEWS from "../../../../../assets/files/news.json";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  public isNavbarCollapsed: boolean;
  public me: UserStructure | null;
  public matomoInfo: boolean;
  public today = new Date();

  public portailAdminUrl = environment.portailAdminUrl;

  public pendingNews: boolean;

  constructor(
    private readonly authService: AuthService,

    public matomoService: MatomoTracker
  ) {
    this.isNavbarCollapsed = false;
    this.me = null;
    this.matomoInfo = false;
    this.pendingNews = true;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe(
      (user: UserStructure | null) => {
        this.me = user;
      }
    );

    // Affichage de matomo
    this.initMatomo();

    // Affichage des nouveautés
    this.checkNews();
  }

  public checkNews(): void {
    const lastNews = localStorage.getItem("news");

    if (lastNews) {
      this.pendingNews = new Date(lastNews) < new Date(DOMIFA_NEWS[0].date);
    }
  }

  public hideNews(): void {
    localStorage.setItem("news", new Date(DOMIFA_NEWS[0].date).toISOString());
    this.pendingNews = false;
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