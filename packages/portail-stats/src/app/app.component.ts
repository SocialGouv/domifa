/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { PortailAdminUser } from "@domifa/common";
import { DsfrHeaderMenuItem, DsfrLink } from "@edugouvfr/ngx-dsfr";
import { PortailStatsAuthService } from "./modules/auth/services/portail-stats-auth.service";
import { LIENS_PARTENAIRES } from "./modules/general/components/static-pages/plan-site/LIENS_PARTENAIRES.const";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: false,
})
export class AppComponent implements OnInit {
  public user: PortailAdminUser | null;
  public readonly partnerLinks = LIENS_PARTENAIRES;
  public currentUrl = "";
  public skipLinks: DsfrLink[] = [];
  public headerToolsLinks: DsfrLink[] = [];
  public menuHeaderItems: DsfrHeaderMenuItem[] = [];
  @ViewChild("notice") public noticeRef!: ElementRef;

  constructor(
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly authService: PortailStatsAuthService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.user = null;
  }

  public ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.titleService.setTitle(
      "Outil de pilotage de la domiciliation en France"
    );

    this.authService.currentUserSubject.subscribe(
      (user: PortailAdminUser | null) => {
        this.user = user;
        if (!user) {
          this.headerToolsLinks = [];
          this.menuHeaderItems = [];
          return;
        }

        this.headerToolsLinks = [
          {
            ariaControls: "logoutModal",
            linkId: "logout",
            mode: "button",
            label: "Se déconnecter",
            icon: "fr-icon-logout-box-r-line",
          },
        ];

        this.menuHeaderItems = [
          {
            linkId: "stats",
            label: "Statistiques de la domiciliation",
            routerLink: "/stats",
          },
        ];
      }
    );

    this.router.events
      .pipe(filter((e: any) => e instanceof NavigationEnd))
      .subscribe((ev: any) => {
        const event = ev as unknown as NavigationEnd;
        const splitUrl = event?.url.split("#");
        this.currentUrl = splitUrl[0];
        this.skipLinks = [
          {
            label: "Aller à la navigation",
            link: `${this.currentUrl}#navigation`,
          },
          { label: "Aller au contenu", link: `${this.currentUrl}#page` },
          {
            label: "Aller au pied de page",
            link: `${this.currentUrl}#footer`,
          },
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

  public logout(event?: DsfrLink): void {
    if (event?.linkId === "logout") {
      this.authService.logoutFromBackend();
      this.headerToolsLinks = [];
      this.menuHeaderItems = [];
      this.cdr.markForCheck();
    }
  }

  public dismissNotice() {
    this.noticeRef.nativeElement.remove();
  }
}
