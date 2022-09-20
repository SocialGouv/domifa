import {
  Component,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Event, NavigationEnd, Router } from "@angular/router";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { UserIdleService } from "angular-user-idle";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { filter } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { environment } from "../environments/environment";
import { UserStructure } from "../_common/model";
import {
  HealthCheckInfo,
  HealthCheckService,
} from "./modules/shared/services/health-check";
import { fadeInOut } from "./shared";

@Component({
  animations: [fadeInOut],
  selector: "app-root",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  public apiVersion: string | null;

  public currentFragment = "";
  public currentUrl = "";
  public modalOptions: NgbModalOptions;

  public me: UserStructure | null;

  @ViewChild("maintenanceModal", { static: true })
  public maintenanceModal!: TemplateRef<NgbModalRef>;

  @ViewChild("helpCenter", { static: true })
  public helpCenter!: TemplateRef<NgbModalRef>;

  @ViewChild("versionModal", { static: true })
  public versionModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly authService: AuthService,
    private readonly matomoInjector: MatomoInjector,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly ngZone: NgZone,
    private readonly userIdleService: UserIdleService,
    public matomo: MatomoTracker,
    public modalService: NgbModal
  ) {
    this.matomoInjector.init(environment.matomo.url, environment.matomo.siteId);
    this.apiVersion = null;

    this.modalOptions = {
      centered: true,
      backdrop: "static",
      ariaLabelledBy: "modal-title",
    };

    this.me = null;
  }

  public refresh(): void {
    window.location.reload();
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.currentUrl = this.router.url;

    // REFRESH TOKEN
    this.authService.currentUserSubject.subscribe(
      (user: UserStructure | null) => {
        this.me = user;
      }
    );

    this.runHealthCheckAndAutoReload();

    this.router.events
      .pipe(filter((e: Event) => e instanceof NavigationEnd))
      .subscribe((ev: Event) => {
        const event = ev as NavigationEnd;
        const splitUrl = event?.url.split("#");
        this.currentUrl = splitUrl[0];

        const sections = ["navigation", "page", "footer"];
        if (typeof splitUrl[1] !== "undefined") {
          //
          if (sections.indexOf(splitUrl[1]) !== -1) {
            this.currentFragment = splitUrl[1];

            document.getElementById("focus").focus();
          }
        } else {
          this.currentUrl = event.url.split("#")[0];
          // Retour au top du curseur
          const mainHeader = document.getElementById("top-site");
          if (mainHeader) {
            mainHeader.focus();
          }

          // Retour au top de la fenêtre
          window.scroll({
            behavior: "smooth",
            left: 0,
            top: 0,
          });
        }
      });
  }

  private runHealthCheckAndAutoReload() {
    if (environment.env === "test") {
      return;
    }

    this.ngZone.run(() => {
      this.healthCheckService
        .enablePeriodicHealthCheck()
        .subscribe((retour: HealthCheckInfo) => {
          if (retour.status === "error") {
            if (!this.modalService.hasOpenModals()) {
              this.userIdleService.stopWatching();

              this.modalService.open(this.maintenanceModal, this.modalOptions);
            }
          } else {
            if (this.apiVersion === null) {
              // Initialisation de la première version
              this.apiVersion = retour?.info?.version?.info || null;
            }

            if (this.apiVersion !== retour?.info?.version?.info) {
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

  public openHelpModal(): void {
    this.modalService.open(this.helpCenter, this.modalOptions);
  }

  public closeHelpModal(): void {
    this.modalService.dismissAll();
  }
}
