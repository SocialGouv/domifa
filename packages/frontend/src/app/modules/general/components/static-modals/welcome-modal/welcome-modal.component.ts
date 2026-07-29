import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Subscription } from "rxjs";
import { AuthService } from "../../../../shared/services";
import { hasAcceptedCurrentCgu } from "../../../../../shared/constants";
import { WelcomeService } from "../../../services/welcome.service";
import { UserStructure } from "@domifa/common";
import DOMIFA_NEWS from "src/assets/files/news.json";
import { AppTourModalComponent } from "../app-tour-modal/app-tour-modal.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../../shared/shared.module";

@Component({
  selector: "app-welcome-modal",
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
  private welcomeFlowChecked = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly welcomeService: WelcomeService
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe({
        next: (user: UserStructure | null) => {
          if (
            !user ||
            this.welcomeFlowChecked ||
            !hasAcceptedCurrentCgu(user.acceptTerms)
          ) {
            return;
          }

          this.welcomeFlowChecked = true;
          requestAnimationFrame(() => this.checkWelcomeFlow(user));
        },
      })
    );
  }

  private checkWelcomeFlow(user: UserStructure): void {
    if (this.newsModalOpen || !hasAcceptedCurrentCgu(user.acceptTerms)) {
      return;
    }

    if (this.isFirstTimeUser()) {
      this.appTourModal.openTour();
    } else if (this.shouldShowNews()) {
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
    requestAnimationFrame(() => this.newsModal.open());
  }

  public onTourComplete(): void {
    this.welcomeService.markNewsAsSeen();

    if (this.shouldShowNews()) {
      this.showNewsModal();
    }
  }

  public hideNews(): void {
    this.newsModal.close();
  }

  public onNewsModalConceal(): void {
    this.newsModalOpen = false;
    this.welcomeService.markNewsAsSeen();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
