import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Event, NavigationEnd, Router } from "@angular/router";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { UserIdleService } from "angular-user-idle";
import { MatomoTracker } from "ngx-matomo";
import { filter, Subscription } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";

import { UserStructure } from "../_common/model";
import { CustomToastService } from "./modules/shared/services";
import {
  HealthCheckInfo,
  HealthCheckService,
} from "./modules/shared/services/health-check";
import { fadeInOut } from "./shared";
import DOMIFA_NEWS from "../assets/files/news.json";

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

  @ViewChild("helpCenter", { static: true })
  public helpCenter!: TemplateRef<NgbModalRef>;

  @ViewChild("versionModal", { static: true })
  public versionModal!: TemplateRef<NgbModalRef>;

  @ViewChild("acceptTermsModal", { static: true })
  public acceptTermsModal!: TemplateRef<NgbModalRef>;

  public acceptTermsForm!: FormGroup;
  public loading: boolean;
  public submitted: boolean;
  public pendingNews: boolean;

  private subscription = new Subscription();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public news: any;

  @ViewChild("newsModal", { static: true })
  public newsModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly userIdleService: UserIdleService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: FormBuilder,
    private readonly modalService: NgbModal,
    public matomo: MatomoTracker
  ) {
    this.apiVersion = localStorage.getItem("version");
    this.submitted = false;
    this.pendingNews = true;
    this.loading = false;
    this.modalOptions = {
      centered: true,
      backdrop: "static",
      ariaLabelledBy: "modal-title",
    };
    this.acceptTermsForm = this.formBuilder.group({
      readCgu: [null, [Validators.requiredTrue]],
      acceptCgu: [null, [Validators.requiredTrue]],
    });
    this.me = null;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.acceptTermsForm.controls;
  }

  public refresh(): void {
    window.location.reload();
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "DomiFa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.currentUrl = this.router.url;

    this.authService.isAuth().subscribe({
      next: () => {
        console.log("");
      },
    });

    this.authService.currentUserSubject.subscribe({
      next: (user: UserStructure | null) => {
        this.me = user;
        if (this.me) {
          if (this.modalService.hasOpenModals()) {
            return;
          }
          if (!this.me.acceptTerms) {
            this.openAcceptTermsModal();
          } else {
            this.checkNews();
            this.userIdleService.resetTimer();
          }
        }
      },
    });

    if (this.me) {
      this.runHealthCheckAndAutoReload();
      this.userIdleService.startWatching();
    }

    // Délai d'inactivité atteint, on déconnecte
    this.userIdleService.onTimeout().subscribe({
      next: () => {
        if (this.authService.currentUserSubject.value !== null) {
          this.authService.logoutAndRedirect(undefined, true);
        }
      },
    });

    // Lancement du décompte
    this.userIdleService.onTimerStart().subscribe({
      next: () => {
        console.log("Déconnexion dans quelques instants...");
      },
    });

    this.router.events
      .pipe(filter((e: Event) => e instanceof NavigationEnd))
      .subscribe((ev: Event) => {
        const event = ev as NavigationEnd;
        const splitUrl = event?.url.split("#");
        this.currentUrl = splitUrl[0];

        const sections = ["navigation", "page", "footer"];
        if (typeof splitUrl[1] !== "undefined") {
          if (sections.indexOf(splitUrl[1]) !== -1) {
            this.currentFragment = splitUrl[1];
            document.getElementById("focus")?.focus();
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

  public checkNews(): void {
    const lastNews = localStorage.getItem("news");

    if (lastNews) {
      this.pendingNews = new Date(lastNews) < new Date(DOMIFA_NEWS[0].date);
    }

    if (this.pendingNews) {
      this.news = DOMIFA_NEWS[0];
      this.modalService.open(this.newsModal, this.modalOptions);
    }
  }

  public hideNews(): void {
    this.modalService.dismissAll();
    localStorage.setItem("news", new Date(DOMIFA_NEWS[0].date).toISOString());
    this.pendingNews = false;
  }

  private runHealthCheckAndAutoReload(): void {
    this.healthCheckService
      .getVersion()
      .subscribe((retour: HealthCheckInfo) => {
        const newVersion = retour?.info?.version?.info.toString();
        // Initialisation de la première version
        if (this.apiVersion === null) {
          localStorage.setItem("version", newVersion);
        }

        if (this.apiVersion !== retour?.info?.version?.info) {
          localStorage.setItem("version", newVersion);
          this.modalService.dismissAll();
          this.modalService.open(this.versionModal, this.modalOptions);
          setTimeout(() => {
            window.location.reload();
          }, 10000);
        }
      });
  }

  public logout(): void {
    this.modalService.dismissAll();
    this.authService.logout();
  }

  public submitAcceptTerms(): void {
    this.submitted = true;

    if (this.acceptTermsForm.invalid) {
      this.toastService.error("Veuillez cocher les deux cases pour continuer");
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.authService.acceptTerms().subscribe({
        next: () => {
          this.loading = false;
          this.toastService.success(
            "Merci, vous pouvez continuer votre navigation"
          );
          this.closeModals();
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Veuillez cocher les 2 cases pour continuer");
        },
      })
    );
  }

  public openAcceptTermsModal(): void {
    this.modalService.open(this.acceptTermsModal, {
      backdrop: "static",
      keyboard: false,
    });
  }

  public openHelpModal(): void {
    this.modalService.open(this.helpCenter, this.modalOptions);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
