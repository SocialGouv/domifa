import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { NgbModal, NgbModalRef, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { AuthService } from "../../../../shared/services";
import { WelcomeService } from "../../../services/welcome.service";
import { UserStructure } from "@domifa/common";
import { DEFAULT_MODAL_OPTIONS } from "src/_common/model";
import DOMIFA_NEWS from "src/assets/files/news.json";
import { AppTourModalComponent } from "../app-tour-modal/app-tour-modal.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../../shared/shared.module";

@Component({
  selector: "app-welcome-modal",
  standalone: true,
  imports: [NgbModule, CommonModule, AppTourModalComponent, SharedModule],
  templateUrl: "./welcome-modal.component.html",
})
export class WelcomeModalComponent implements OnInit, OnDestroy {
  @ViewChild("newsModal", { static: true })
  public newsModal!: TemplateRef<NgbModalRef>;

  @ViewChild(AppTourModalComponent)
  public appTourModal!: AppTourModalComponent;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public news: any;

  private readonly subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly welcomeService: WelcomeService
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe({
        next: (user: UserStructure | null) => {
          if (!user || this.modalService.hasOpenModals()) {
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
    if (this.modalService.hasOpenModals()) {
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
    this.modalService.open(this.newsModal, DEFAULT_MODAL_OPTIONS);
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
    this.modalService.dismissAll();
    this.welcomeService.markNewsAsSeen();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
