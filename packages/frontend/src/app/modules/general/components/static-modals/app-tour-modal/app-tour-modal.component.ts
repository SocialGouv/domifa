import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { MatomoTracker } from "ngx-matomo-client";
import { AuthService } from "../../../../shared/services";
import { UserStructure } from "@domifa/common";
import { Subscription } from "rxjs";

@Component({
  selector: "app-app-tour-modal",
  templateUrl: "./app-tour-modal.component.html",
  standalone: true,
  imports: [DsfrModalComponent],
  styleUrls: ["./app-tour-modal.component.css"],
})
export class AppTourModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild("appTourModal", { static: false })
  public appTourModal!: DsfrModalComponent;

  @Output() tourComplete = new EventEmitter<void>();

  public currentStep = 0;
  public totalSteps = 3;
  public showTranscription = false;

  private startTime!: number;
  public currentRoleStep: {
    subtitle: string;
    description: string;
    actions: string[];
  };

  public showTour = !localStorage.getItem("appTourSeen");

  tourSteps = [
    {
      title: "Bienvenue sur DomiFa",
      content:
        "Découvrez vos premiers pas sur l'outil grâce à cette courte présentation.",
    },
    {
      title: "✨ Réalisez vos premières actions",
      roles: {
        admin: {
          subtitle: "Vous gérez la structure et les utilisateurs.",
          description: "Choisissez votre première action :",
          actions: [
            "Créer les comptes utilisateurs de votre structure.",
            "Importer vos données domiciliés.",
            "Créer une demande de domiciliation.",
          ],
        },
        responsable: {
          subtitle:
            "Vous pilotez la gestion quotidienne des dossiers et des domiciliés :",
          description: "Choisissez votre première action :",
          actions: [
            "Créer une demande de domiciliation.",
            "Modifier les informations sur un dossier domicilié (radier, renouveler, supprimer, ajouter une interaction).",
          ],
        },
        simple: {
          subtitle:
            "Vous pilotez la gestion quotidienne des dossiers et des domiciliés :",
          description: "Choisissez votre première action :",
          actions: [
            "Créer une demande de domiciliation.",
            "Modifier les informations sur un dossier domicilié (radier, renouveler, supprimer, ajouter une interaction).",
          ],
        },
        facteur: {
          subtitle: "Vous êtes le premier contact des domiciliés :",
          description: "Choisissez votre première action :",
          actions: [
            "Ajouter une interaction sur un dossier (courrier, passages, appels).",
          ],
        },
      },
    },
  ];
  public me!: UserStructure | null;
  private readonly subscription = new Subscription();

  constructor(
    private readonly matomo: MatomoTracker,
    private readonly authService: AuthService
  ) {
    this.me = this.authService.currentUserValue;
  }

  ngAfterViewInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe({
        next: (user: UserStructure | null) => {
          if (user && user.role && user.acceptTerms) {
            this.currentRoleStep = this.tourSteps[1].roles[this.me.role];
            if (!localStorage.getItem("appTourSeen")) {
              this.appTourModal.open();
            }
          }
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openTour(): void {
    if (!this.me || !this.me.role) {
      return;
    }
    this.currentRoleStep = this.tourSteps[1].roles[this.me.role];
    this.currentStep = 0;
    this.startTime = Date.now();
    this.showTranscription = false;
    this.matomo.trackEvent("APP_TOUR", "OPEN", "TOUR_OPENED", 1);
    this.appTourModal.open();
  }

  public nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.matomo.trackEvent(
        "APP_TOUR",
        "NAVIGATION",
        `STEP_${this.currentStep + 1}_TO_${this.currentStep + 2}`,
        1
      );
      this.currentStep++;
    } else {
      this.finishTour();
    }
  }

  public previousStep(): void {
    if (this.currentStep > 0) {
      this.matomo.trackEvent(
        "APP_TOUR",
        "NAVIGATION",
        `STEP_${this.currentStep + 1}_TO_${this.currentStep}`,
        1
      );
      this.currentStep--;
    }
  }

  public toggleTranscription(): void {
    this.showTranscription = !this.showTranscription;
    this.matomo.trackEvent(
      "APP_TOUR",
      "TRANSCRIPTION",
      this.showTranscription ? "SHOW" : "HIDE",
      this.showTranscription ? 1 : 0
    );
  }

  public finishTour(): void {
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
    this.matomo.trackEvent("APP_TOUR", "COMPLETE", "FINISHED", timeSpent);
    localStorage.setItem("appTourSeen", "true");
    this.appTourModal.close();
    this.tourComplete.emit();
  }

  public skipTour(): void {
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
    this.matomo.trackEvent("APP_TOUR", "SKIP", "SKIPPED", timeSpent);
    localStorage.setItem("appTourSeen", "true");
    this.appTourModal.close();
    this.tourComplete.emit();
  }
}
