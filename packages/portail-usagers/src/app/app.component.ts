import { PortailUsagerProfile } from "./../_common/_portail-usager/PortailUsagerProfile.type";
import { UsagerAuthService } from "./modules/usager-auth/services/usager-auth.service";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { LIENS_PARTENAIRES } from "./modules/general/components/_static/plan-site/LIENS_PARTENAIRES.const";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public title: string;
  public apiVersion: string | null;
  public usagerProfile: PortailUsagerProfile | null;
  public currentUrl = "";
  public readonly partnerLinks = LIENS_PARTENAIRES;

  constructor(
    private readonly titleService: Title,
    private readonly router: Router,
    private readonly usagerAuthService: UsagerAuthService,
  ) {
    this.apiVersion = null;
    this.usagerProfile = null;
    this.title = "Bienvenue sur le portail usager de DomiFa";
    this.isNavbarCollapsed = false;
    this.matomoInfo = false;
    this.initMatomo();
  }

  public isNavbarCollapsed: boolean;
  public matomoInfo: boolean;

  public initMatomo(): void {
    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Mon DomiFa, l'outil qui facilite la gestion des structures domiciliatirices",
    );

    this.usagerAuthService.currentUsagerSubject.subscribe(
      (usager: PortailUsagerProfile | null) => {
        this.usagerProfile = usager;
      },
    );

    this.router.events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pipe(filter((e: any) => e instanceof NavigationEnd))
      .subscribe((ev: Event) => {
        const event = ev as unknown as NavigationEnd;
        const splitUrl = event?.url.split("#");
        this.currentUrl = splitUrl[0];

        const sections = ["page", "footer"];
        if (typeof splitUrl[1] !== "undefined") {
          if (sections.indexOf(splitUrl[1]) !== -1) {
            const fragment = splitUrl[1];
            const element = document.getElementById(fragment);
            if (element) {
              element.tabIndex = -1;
              element.focus();
            }
          }
        } else {
          this.currentUrl = event.url.split("#")[0];
          // Retour au top du curseur
          const mainHeader = document.getElementById("top-site");
          if (mainHeader) {
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
