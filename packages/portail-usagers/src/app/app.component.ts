import { UsagerAuthService } from "./modules/usager-auth/services/usager-auth.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { LIENS_PARTENAIRES } from "./modules/general/components/_static/plan-site/LIENS_PARTENAIRES.const";
import { PortailUsagerProfile } from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";
import DOMIFA_NEWS from "../assets/files/news.json";
import { DsfrLink, DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { NewsItem } from "./modules/shared/types/NewsItem.type";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  public title: string;
  public apiVersion: string | null;
  public usagerProfile: PortailUsagerProfile | null;
  public currentUrl = "";
  public readonly partnerLinks = LIENS_PARTENAIRES;
  public pendingNews = false;
  public skipLinks: DsfrLink[] = [];
  public news: NewsItem[] = [];

  @ViewChild(DsfrModalComponent) newsModal!: DsfrModalComponent;
  constructor(
    private readonly titleService: Title,
    private readonly router: Router,
    private readonly usagerAuthService: UsagerAuthService,
    private readonly matomo: MatomoTracker
  ) {
    this.apiVersion = null;
    this.usagerProfile = null;
    this.title = "Bienvenue sur le portail usager de Mon DomiFa";
    this.isNavbarCollapsed = false;
    this.matomoInfo = false;
    this.initMatomo();
  }

  public isNavbarCollapsed: boolean;
  public matomoInfo: boolean;

  public initMatomo(): void {
    const matomo = localStorage.getItem("matomo");
    const matomoOptedIn = localStorage.getItem("matomo-opted-in");
    let disableMatomo = false;
    this.matomoInfo = matomo === "done";

    if (matomoOptedIn === null) {
      localStorage.setItem("matomo-opted-in", JSON.stringify(true));
    } else {
      disableMatomo = JSON.parse(matomoOptedIn) === true;
    }

    if (!disableMatomo) {
      this.matomo.optUserOut();
    } else {
      localStorage.setItem("matomo-opted-in", JSON.stringify(true));
    }
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public checkNews(): void {
    const lastNews = localStorage.getItem("NEWS_MON_DOMIFA");

    this.pendingNews = lastNews
      ? new Date(lastNews) < new Date(DOMIFA_NEWS[0].date)
      : true;

    if (this.pendingNews) {
      this.news = [DOMIFA_NEWS[0]];
      this.newsModal.open();
    }
  }

  public hideNews(): void {
    this.newsModal.close();
    localStorage.setItem(
      "NEWS_MON_DOMIFA",
      new Date(DOMIFA_NEWS[0].date).toISOString()
    );
    this.pendingNews = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Mon DomiFa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.usagerAuthService.currentUsagerSubject.subscribe(
      (usager: PortailUsagerProfile | null) => {
        this.usagerProfile = usager;

        if (usager) {
          this.checkNews();
        }
      }
    );

    this.router.events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pipe(filter((e: any) => e instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => {
        const event = ev as unknown as NavigationEnd;
        const splitUrl = event?.url.split("#");
        this.currentUrl = splitUrl[0];
        this.skipLinks = [
          { label: "Aller au contenu", link: `${this.currentUrl}#page` },
          { label: "Aller au pied de page", link: `${this.currentUrl}#footer` },
        ];
        if (typeof splitUrl[1] !== "undefined") {
          const fragment = splitUrl[1];
          const element = document.getElementById(fragment);
          if (element) {
            element.tabIndex = -1;
            element.focus();
          }
        } else {
          this.currentUrl = event.url;
          const mainHeader = document.getElementById("top-site");
          if (mainHeader) {
            mainHeader.tabIndex = -1;
            mainHeader.focus();
          }

          window.scroll({
            behavior: "smooth",
            left: 0,
            top: 0,
          });
        }
      });
  }

  public logout(): void {
    this.usagerAuthService.logoutAndRedirect();
  }
}
