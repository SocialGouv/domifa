import { Component, OnInit, ViewChild } from "@angular/core";
import { UserIdleService } from "angular-user-idle";
import { Subscription } from "rxjs";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { PortailUsagerProfile } from "@domifa/common";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-idle-manager",
  templateUrl: "./idle-manager.component.html",
})
export class IdleManagerComponent implements OnInit {
  @ViewChild(DsfrModalComponent)
  idleModal!: DsfrModalComponent;
  public timerCount = 0;

  private subscription = new Subscription();
  private timerStartSubscription!: Subscription;
  private timeoutSubscription!: Subscription;

  public isWatching = false;
  public modalIsOpen = false;
  public timeIsUp = false;

  constructor(
    private readonly userIdleService: UserIdleService,
    private readonly authService: UsagerAuthService,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUsagerSubject.subscribe({
        next: (user: PortailUsagerProfile | null) => {
          if (user && !this.isWatching) {
            this.startWatching();
          }

          if (!user && this.isWatching) {
            this.stopWatching();
          }
        },
      }),
    );
  }

  public startWatching() {
    this.isWatching = true;
    this.timeIsUp = false;
    this.modalIsOpen = false;

    this.userIdleService.startWatching();

    this.timeoutSubscription = this.userIdleService.onTimeout().subscribe({
      next: () => {
        this.logout();
      },
    });

    this.timerStartSubscription = this.userIdleService
      .onTimerStart()
      .subscribe({
        next: () => {
          if (!this.modalIsOpen) {
            this.openIdleModal();
            this.modalIsOpen = true;
          }
        },
      });
  }

  public stopWatching() {
    this.isWatching = false;
    this.timeIsUp = false;
    this.timerStartSubscription.unsubscribe();
    this.timeoutSubscription.unsubscribe();
    this.userIdleService.stopWatching();
    this.closeModals();
  }

  public resetTimer() {
    this.stopWatching();
    this.startWatching();
  }

  public logout(): void {
    this.closeModals();
    this.authService.logoutAndRedirect();
  }

  public openIdleModal(): void {
    this.closeModals();
    this.idleModal.open();
  }

  public closeModals(): void {
    this.idleModal.close();
  }
}
