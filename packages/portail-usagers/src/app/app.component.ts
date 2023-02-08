import { PortailUsagerProfile } from "./../_common/_portail-usager/PortailUsagerProfile.type";
import { UsagerAuthService } from "./modules/usager-auth/services/usager-auth.service";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { MatomoTracker } from "@ngx-matomo/tracker";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  public title: string;
  public apiVersion: string | null;
  public usagerProfile: PortailUsagerProfile | null;

  constructor(
    private readonly titleService: Title,
    private readonly router: Router,
    private readonly usagerAuthService: UsagerAuthService,
    private readonly matomoService: MatomoTracker,
  ) {
    this.apiVersion = null;
    this.usagerProfile = null;
    this.title = "Bienvenue sur le portail usager de Domifa";
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
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices",
    );

    this.usagerAuthService.currentUsagerSubject.subscribe(
      (usager: PortailUsagerProfile | null) => {
        this.usagerProfile = usager;
      },
    );

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Retour au top de la fenêtre
        window.scroll({
          behavior: "smooth",
          left: 0,
          top: 0,
        });
      });
  }

  public logout(): void {
    this.usagerAuthService.logoutAndRedirect();
  }
}
