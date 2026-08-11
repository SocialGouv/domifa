import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { Subscription } from "rxjs";
import { PortailAdminUser } from "@domifa/common";
import { LIENS_PARTENAIRES } from "./LIENS_PARTENAIRES.const";
import { SITEMAP_LINKS, SITEMAP_LINKS_LOGGED } from "./plan-site.constants";
import { PortailStatsAuthService } from "../../../../auth/services/portail-stats-auth.service";

@Component({
  selector: "app-plan-site",
  templateUrl: "./plan-site.component.html",
  styleUrls: ["./plan-site.component.css"],
  imports: [CommonModule, RouterModule],
})
export class PlanSiteComponent implements OnInit, OnDestroy {
  public readonly siteMapLinksLogged = SITEMAP_LINKS_LOGGED;
  public readonly sitemapLinks = SITEMAP_LINKS;
  public readonly partnerLinks = LIENS_PARTENAIRES;

  public user!: PortailAdminUser | null;
  private readonly subscription = new Subscription();

  constructor(
    private readonly titleService: Title,
    private readonly authService: PortailStatsAuthService
  ) {
    this.user = null;
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe(
        (user: PortailAdminUser | null) => {
          this.user = user;
        }
      )
    );
    this.titleService.setTitle("Plan du site de l'outil de pilotage DomiFa");
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
