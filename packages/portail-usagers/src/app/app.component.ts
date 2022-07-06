import { PortailUsagerProfile } from "./../_common/_portail-usager/PortailUsagerProfile.type";
import { UsagerAuthService } from "./modules/usager-auth/services/usager-auth.service";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

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
  ) {
    this.apiVersion = null;
    this.usagerProfile = null;
    this.title = "Bienvenue sur le portail usager de Domifa";
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
