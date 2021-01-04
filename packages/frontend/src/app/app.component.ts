import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { Observable, timer } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { environment } from "../environments/environment";
import { AppUser } from "../_common/model";
import {
  HealthCheckService,
  HealthCheckType,
} from "./modules/shared/services/health-check.service";

import { fadeInOut } from "./shared/animations";
@Component({
  animations: [fadeInOut],
  selector: "app-root",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  public help: boolean;
  public isNavbarCollapsed: boolean;
  public isAllowed: any;

  public domifaNews: any;
  public newsLabels: any;

  public matomoInfo: boolean;
  public apiVersion: string;

  public modalOptions: NgbModalOptions;
  public me: AppUser;

  @ViewChild("newsCenter", { static: true })
  public newsCenter!: TemplateRef<any>;

  @ViewChild("maintenanceModal", { static: true })
  public maintenanceModal!: TemplateRef<any>;

  @ViewChild("versionModal", { static: true })
  public versionModal!: TemplateRef<any>;

  constructor(
    private apiService: HealthCheckService,
    private authService: AuthService,
    private matomoInjector: MatomoInjector,
    private matomo: MatomoTracker,
    private modalService: NgbModal,
    private http: HttpClient,
    private router: Router,
    private titleService: Title
  ) {
    this.help = false;
    this.isNavbarCollapsed = false;
    this.newsLabels = {
      bug: "Améliorations",
      new: "Nouveauté",
    };

    this.domifaNews = null;
    this.matomoInjector.init(environment.matomo.url, environment.matomo.siteId);
    this.apiVersion = null;

    this.modalOptions = {
      centered: true,
      backdrop: "static",
      keyboard: false,
    };

    if (environment.env !== "test") {
      timer(0, 6000)
        .pipe(mergeMap(() => this.apiService.healthCheck()))
        .subscribe((retour: HealthCheckType) => {
          if (retour.status === "error") {
            if (!this.modalService.hasOpenModals()) {
              this.modalService.open(this.maintenanceModal, this.modalOptions);
            }
          } else {
            this.modalService.dismissAll();
            // Initialisation de la version
            if (this.apiVersion === null) {
              this.apiVersion = retour.info.version.info;
            }

            // On update la page
            if (this.apiVersion !== retour.info.version.info) {
              this.modalService.open(this.versionModal, this.modalOptions);
              // Reload dans 5 secondes
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            }
          }
        });
    }
  }

  public refresh(): void {
    window.location.reload();
  }

  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.getJSON().subscribe((domifaNews) => {
      this.domifaNews = domifaNews[0];

      const lastNews = localStorage.getItem("news");

      if (
        !lastNews ||
        (lastNews && new Date(lastNews) < new Date(domifaNews[0].date))
      ) {
        this.modalService.open(this.newsCenter, {
          backdrop: "static",
          centered: true,
        });
      }
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scroll({
        behavior: "smooth",
        left: 0,
        top: 0,
      });
    });

    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";

    this.matomo.setUserId("0");
  }

  public getJSON(): Observable<any> {
    return this.http.get("assets/files/news.json");
  }

  public openModal(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeHelpModal(): void {
    this.modalService.dismissAll();
  }

  public closeNewsModal(): void {
    this.modalService.dismissAll();
    localStorage.setItem("news", new Date(this.domifaNews.date).toISOString());
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(["/connexion"]);
  }
}
