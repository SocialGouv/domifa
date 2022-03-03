import {
  Component,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { UserIdleService } from "angular-user-idle";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
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

  public modalOptions: NgbModalOptions;

  public me: UserStructure;

  @ViewChild("maintenanceModal", { static: true })
  public maintenanceModal!: TemplateRef<NgbModalRef>;

  @ViewChild("helpCenter", { static: true })
  public helpCenter!: TemplateRef<NgbModalRef>;

  @ViewChild("versionModal", { static: true })
  public versionModal!: TemplateRef<NgbModalRef>;

  constructor(
    private healthCheckService: HealthCheckService,
    private authService: AuthService,
    private matomoInjector: MatomoInjector,
    public modalService: NgbModal,
    private router: Router,
    private titleService: Title,
    private ngZone: NgZone,
    public matomo: MatomoTracker,
    private userIdleService: UserIdleService
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

    // REFRESH TOKEN
    this.authService.isAuth().subscribe();
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.runHealthCheckAndAutoReload();

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }

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

  public openHelpModal(): void {
    this.modalService.open(this.helpCenter, this.modalOptions);
  }

  public closeHelpModal(): void {
    this.modalService.dismissAll();
  }
}
