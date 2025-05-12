import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Event, NavigationEnd, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo-client";
import { filter, Subscription } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";

import { DEFAULT_MODAL_OPTIONS } from "../_common/model";
import { CustomToastService } from "./modules/shared/services";

import { fadeInOut } from "./shared";
import DOMIFA_NEWS from "../assets/files/news.json";
import { LIENS_PARTENAIRES } from "./modules/general/components/plan-site/LIENS_PARTENAIRES.const";
import { UserStructure } from "@domifa/common";

@Component({
  animations: [fadeInOut],
  selector: "app-root",
  styleUrls: ["./app.component.scss"],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit, OnDestroy {
  public apiVersion: string | null;
  public currentUrl = "";

  public me: UserStructure | null;

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

  public readonly partnerLinks = LIENS_PARTENAIRES;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: FormBuilder,
    private readonly modalService: NgbModal,

    public matomo: MatomoTracker
  ) {
    this.apiVersion = localStorage.getItem("version");

    this.submitted = false;
    this.pendingNews = false;
    this.loading = false;
    this.me = null;
    this.initCguForm();
    this.checkMatomo();
  }

  private checkMatomo() {
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

  private initCguForm() {
    this.acceptTermsForm = this.formBuilder.group({
      acceptCgu: [null, [Validators.requiredTrue]],
    });
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.acceptTermsForm.controls;
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

    this.authService.currentUserSubject.subscribe({
      next: (user: UserStructure | null) => {
        this.me = user;
        if (this.me) {
          if (this.modalService.hasOpenModals()) {
            return;
          }

          const newVersion = this.me.domifaVersion;
          // Initialisation de la première version
          if (this.apiVersion === null) {
            this.apiVersion = newVersion;
            localStorage.setItem("version", newVersion);
          } else if (this.apiVersion !== newVersion) {
            localStorage.setItem("version", newVersion);
            this.modalService.dismissAll();
            this.modalService.open(this.versionModal, DEFAULT_MODAL_OPTIONS);
            setTimeout(() => {
              window.location.reload();
            }, 10000);
            return;
          }

          if (this.modalService.hasOpenModals()) {
            return;
          }

          if (!this.me.acceptTerms) {
            this.openAcceptTermsModal();
            this.initCguForm();
          } else {
            this.checkNews();
          }
        }
      },
    });

    this.router.events
      .pipe(filter((e: Event) => e instanceof NavigationEnd))
      .subscribe((ev: Event) => {
        const event = ev as NavigationEnd;
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

  public checkNews(): void {
    const lastNews = localStorage.getItem("news");
    this.pendingNews = lastNews
      ? new Date(lastNews) < new Date(DOMIFA_NEWS[0].date)
      : true;

    if (this.pendingNews) {
      this.news = DOMIFA_NEWS[0];
      this.modalService.open(this.newsModal, DEFAULT_MODAL_OPTIONS);
    }
  }

  public hideNews(): void {
    this.modalService.dismissAll();
    localStorage.setItem("news", new Date(DOMIFA_NEWS[0].date).toISOString());
    this.pendingNews = false;
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
          this.submitted = false;
          this.loading = false;
          this.toastService.success(
            "Merci, vous pouvez continuer votre navigation"
          );
          this.closeModals();
          this.refresh();
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
      ...DEFAULT_MODAL_OPTIONS,
      keyboard: false,
    });
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
