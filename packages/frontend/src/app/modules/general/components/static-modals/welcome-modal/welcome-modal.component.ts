import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Subscription } from "rxjs";
import { AuthService } from "../../../../shared/services";
import { WelcomeService } from "../../../services/welcome.service";
import { UserStructure } from "@domifa/common";
import DOMIFA_NEWS from "src/assets/files/news.json";
import { AppTourModalComponent } from "../app-tour-modal/app-tour-modal.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../../shared/shared.module";

@Component({
  selector: "app-welcome-modal",
  standalone: true,
  imports: [
    DsfrModalComponent,
    CommonModule,
    AppTourModalComponent,
    SharedModule,
  ],
  templateUrl: "./welcome-modal.component.html",
})
export class WelcomeModalComponent implements OnInit, OnDestroy {
  @ViewChild("newsModal", { static: false })
  public newsModal!: DsfrModalComponent;

  @ViewChild(AppTourModalComponent)
  public appTourModal!: AppTourModalComponent;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public news: any;

  public newsModalOpen = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly welcomeService: WelcomeService
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe({
        next: (user: UserStructure | null) => {
          if (!user || this.newsModalOpen) {
            return;
          }

          // Wait a bit for other modals (version, acceptTerms) to finish
          setTimeout(() => {
            this.checkWelcomeFlow();
          }, 500);
        },
      })
    );
  }

  private checkWelcomeFlow(): void {
    if (this.newsModalOpen) {
      return;
    }

    if (this.isFirstTimeUser()) {
      // Première connexion → app tour
      this.appTourModal.openTour();
    } else if (this.shouldShowNews()) {
      // Utilisateur existant → news si disponibles
      this.showNewsModal();
    }
  }

  private isFirstTimeUser(): boolean {
    const appTourSeen = localStorage.getItem("appTourSeen");
    return appTourSeen !== "true";
  }

  private shouldShowNews(): boolean {
    const hasNewNews = this.welcomeService.checkForNewNews();
    this.welcomeService.setPendingNews(hasNewNews);
    return hasNewNews;
  }

  private showNewsModal(): void {
    this.news = DOMIFA_NEWS[0];
    this.newsModalOpen = true;
    this.newsModal.open();
  }

  public onTourComplete(): void {
    // Marquer les news comme vues pour éviter d'afficher d'anciennes news
    this.welcomeService.markNewsAsSeen();

    // Tour terminé, vérifier si news à afficher
    setTimeout(() => {
      if (this.shouldShowNews()) {
        this.showNewsModal();
      }
    }, 500);
  }

  public hideNews(): void {
    this.newsModalOpen = false;
    this.newsModal.close();
    this.welcomeService.markNewsAsSeen();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
