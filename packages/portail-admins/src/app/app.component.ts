/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { AdminAuthService } from "./modules/admin-auth/services/admin-auth.service";
import { LIENS_PARTENAIRES } from "./modules/general/components/static-pages/plan-site/LIENS_PARTENAIRES.const";
import { PortailAdminUser } from "@domifa/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public adminProfile: PortailAdminUser | null;
  public readonly partnerLinks = LIENS_PARTENAIRES;
  public currentUrl = "";

  constructor(
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly adminAuthService: AdminAuthService
  ) {
    this.adminProfile = null;
  }

  public ngOnInit(): void {
    this.currentUrl = this.router.url;

    this.titleService.setTitle("Bienvenue sur le portail admin de DomiFa");

    this.adminAuthService.currentAdminSubject.subscribe(
      (admin: PortailAdminUser | null) => {
        this.adminProfile = admin;
      }
    );

    this.router.events
      .pipe(filter((e: any) => e instanceof NavigationEnd))
      .subscribe((ev: any) => {
        const event = ev as unknown as NavigationEnd;
        const splitUrl = event?.url.split("#");
        this.currentUrl = splitUrl[0];

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
    this.adminAuthService.logoutAndRedirect();
  }
}
