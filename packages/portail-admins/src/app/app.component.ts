import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
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
    private titleService: Title,
    private router: Router,
    private readonly adminAuthService: AdminAuthService
  ) {
    this.apiVersion = null;
    this.adminProfile = null;
    this.title = "Bienvenue sur le portail admin de Domifa";
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.adminAuthService.isAuth().subscribe();
    this.adminAuthService.currentAdminSubject.subscribe(
      (admin: PortailAdminProfile | null) => {
        this.adminProfile = admin;
      }
    );
  }

  public logout(): void {
    this.adminAuthService.logoutAndRedirect();
  }

  private runHealthCheckAndAutoReload() {}
}
