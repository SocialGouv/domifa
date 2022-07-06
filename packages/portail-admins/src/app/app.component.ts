import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { PortailAdminProfile } from "./../_common/_portail-admin/PortailAdminProfile.type";
import { AdminAuthService } from "./modules/admin-auth/services/admin-auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  public title: string;
  public apiVersion: string | null;
  public adminProfile: PortailAdminProfile | null;

  constructor(
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly adminAuthService: AdminAuthService
  ) {
    this.apiVersion = null;
    this.adminProfile = null;
    this.title = "Bienvenue sur le portail admin de DomiFa";
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "DomiFa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.adminAuthService.isAuth().subscribe();
    this.adminAuthService.currentAdminSubject.subscribe(
      (admin: PortailAdminProfile | null) => {
        this.adminProfile = admin;
      }
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
    this.adminAuthService.logoutAndRedirect();
  }
}
