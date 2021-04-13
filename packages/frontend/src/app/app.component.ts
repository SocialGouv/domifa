import { HttpClient } from "@angular/common/http";
import {
  Component,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { Observable } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { environment } from "../environments/environment";
import { AppUser } from "../_common/model";
import {
  HealthCheckInfo,
  HealthCheckService,
} from "./modules/shared/services/health-check";
import { fadeInOut } from "./shared/animations";

@Component({
  animations: [fadeInOut],
  selector: "app-root",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  public help: boolean;

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
    private healthCheckService: HealthCheckService,
    private authService: AuthService,
    private matomoInjector: MatomoInjector,
    private matomo: MatomoTracker,
    private modalService: NgbModal,
    private http: HttpClient,
    private router: Router,
    private titleService: Title,
    private ngZone: NgZone
  ) {
    this.help = false;

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

    this.me = null;
  }

  public refresh(): void {
    window.location.reload();
  }

  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    // REFRESH TOKEN
    this.authService.isAuth().subscribe();
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

    this.runHealthCheckAndAutoReload();
  }

  private runHealthCheckAndAutoReload() {
    if (environment.env !== "test") {
      this.ngZone.run(() => {
        this.healthCheckService
          .enablePeriodicHealthCheck()
          .subscribe((retour: HealthCheckInfo) => {
            if (retour.status === "error") {
              if (!this.modalService.hasOpenModals()) {
                this.modalService.open(
                  this.maintenanceModal,
                  this.modalOptions
                );
              }
            } else {
              if (this.apiVersion === null) {
                // Initialisation de la première version
                this.apiVersion = retour.info.version.info;
              }

              if (this.apiVersion !== retour.info.version.info) {
                this.modalService.dismissAll();
                // On update la page
                this.modalService.open(this.versionModal, this.modalOptions);
                // Reload dans 5 secondes
                setTimeout(() => {
                  window.location.reload();
                }, 5000);
              }
            }
          });
      });
    }
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
}
