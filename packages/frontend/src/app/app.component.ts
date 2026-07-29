import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Event, NavigationEnd, Router } from "@angular/router";
import { MatomoTracker } from "ngx-matomo-client";
import { filter, Subscription } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { fadeInOut } from "./shared";
import { LIENS_PARTENAIRES } from "./modules/general/components/plan-site/LIENS_PARTENAIRES.const";
import { UserStructure } from "@domifa/common";
import { DsfrModalComponent, DsfrModalAction } from "@edugouvfr/ngx-dsfr";

@Component({
  animations: [fadeInOut],
  selector: "app-root",
  styleUrls: ["./app.component.scss"],
  templateUrl: "./app.component.html",
  standalone: false,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  public apiVersion: string | null;
  public currentUrl = "";
  public me: UserStructure | null;

  @ViewChild("versionModal", { static: false })
  public versionModalRef!: DsfrModalComponent;

  private isVersionModalOpen = false;

  public readonly versionModalActions: DsfrModalAction[] = [
    {
      label: "Actualiser la page",
      icon: "fr-icon-refresh-line",
      callback: () => this.refresh(),
    },
  ];

  private readonly subscription = new Subscription();
  public readonly partnerLinks = LIENS_PARTENAIRES;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly matomo: MatomoTracker
  ) {
    this.apiVersion = localStorage.getItem("version");
    this.me = null;
    this.checkMatomo();
  }

  public refresh(): void {
    window.location.reload();
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "DomiFa, l'outil qui facilite la gestion des structures domiciliatrices"
    );

    this.currentUrl = this.router.url;
    this.authService.isAuth().subscribe();

    this.router.events
      .pipe(filter((e: Event) => e instanceof NavigationEnd))
      .subscribe((ev: Event) => {
        const event = ev as NavigationEnd;
        const splitUrl = event?.url.split("#");
        this.currentUrl = splitUrl[0];

        if (typeof splitUrl[1] !== "undefined") {
          const element = document.getElementById(splitUrl[1]);
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
          window.scroll({ behavior: "smooth", left: 0, top: 0 });
        }
      });
  }

  public ngAfterViewInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe({
        next: (user: UserStructure | null) => {
          this.me = user;

          if (!user || this.isVersionModalOpen) {
            return;
          }

          const newVersion = this.me.domifaVersion;

          if (this.apiVersion === null) {
            this.apiVersion = newVersion;
            localStorage.setItem("version", newVersion);
          } else if (this.apiVersion !== newVersion) {
            localStorage.setItem("version", newVersion);
            this.isVersionModalOpen = true;
            requestAnimationFrame(() => this.versionModalRef.open());
            setTimeout(() => window.location.reload(), 10000);
          }
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkMatomo(): void {
    if (localStorage.getItem("matomo-opted-in") === null) {
      localStorage.setItem("matomo-opted-in", JSON.stringify(true));
    }
    const disableMatomo =
      JSON.parse(localStorage.getItem("matomo-opted-in")) === true;
    if (!disableMatomo) {
      this.matomo.optUserOut();
    } else {
      localStorage.setItem("matomo-opted-in", JSON.stringify(true));
    }
  }
}
