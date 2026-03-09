import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Event, NavigationEnd, Router } from "@angular/router";
import { MatomoTracker } from "ngx-matomo-client";
import { filter, Subscription, switchMap } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { CustomToastService } from "./modules/shared/services";
import { fadeInOut } from "./shared";
import { LIENS_PARTENAIRES } from "./modules/general/components/plan-site/LIENS_PARTENAIRES.const";
import { UserStructure } from "@domifa/common";
import { DsfrModalComponent, DsfrModalAction } from "@edugouvfr/ngx-dsfr";

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

  @ViewChild("acceptTermsModal")
  public acceptTermsModalRef!: DsfrModalComponent;

  @ViewChild("versionModal")
  public versionModalRef!: DsfrModalComponent;

  public acceptTermsForm!: FormGroup;
  public loading = false;
  public submitted = false;

  // Permet de bloquer la réouverture si une modale est déjà ouverte
  private isAnyModalOpen = false;

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
    private readonly toastService: CustomToastService,
    private readonly formBuilder: FormBuilder,
    private readonly matomo: MatomoTracker
  ) {
    this.apiVersion = localStorage.getItem("version");
    this.me = null;
    this.initCguForm();
    this.checkMatomo();
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.acceptTermsForm.controls;
  }

  public refresh(): void {
    window.location.reload();
  }

  public onAcceptTermsModalClosed(): void {
    this.isAnyModalOpen = false;
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

        if (!user || this.isAnyModalOpen) {
          return;
        }

        const newVersion = this.me.domifaVersion;

        if (this.apiVersion === null) {
          this.apiVersion = newVersion;
          localStorage.setItem("version", newVersion);
        } else if (this.apiVersion !== newVersion) {
          localStorage.setItem("version", newVersion);
          this.isAnyModalOpen = true;
          this.versionModalRef.open();
          setTimeout(() => window.location.reload(), 10000);
          return;
        }

        if (!this.me.acceptTerms) {
          this.openAcceptTermsModal();
          this.initCguForm();
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

  public logout(): void {
    this.acceptTermsModalRef.close();
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
      this.authService
        .acceptTerms()
        .pipe(switchMap(() => this.authService.isAuth()))
        .subscribe({
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
            this.toastService.error("Veuillez accepter les CGU pour continuer");
          },
        })
    );
  }

  public openAcceptTermsModal(): void {
    this.isAnyModalOpen = true;
    this.acceptTermsModalRef.open();
  }

  public closeModals(): void {
    this.acceptTermsModalRef.close();
    this.isAnyModalOpen = false;
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

  private initCguForm(): void {
    this.acceptTermsForm = this.formBuilder.group({
      acceptCgu: [null, [Validators.requiredTrue]],
    });
  }
}
