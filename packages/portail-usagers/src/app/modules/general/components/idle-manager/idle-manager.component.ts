import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserIdleService } from "angular-user-idle";
import { Subscription } from "rxjs";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { PortailUsagerProfile } from "@domifa/common";

@Component({
  selector: "app-idle-manager",
  templateUrl: "./idle-manager.component.html",
})
export class IdleManagerComponent implements OnInit {
  @ViewChild("idleModal", { static: true })
  public idleModal!: TemplateRef<NgbModalRef>;
  public timerCount = 0;

  private subscription = new Subscription();
  private timerStartSubscription!: Subscription;
  private timeoutSubscription!: Subscription;

  public isWatching = false;
  public modalIsOpen = false;
  public timeIsUp = false;

  constructor(
    private readonly modalService: NgbModal,
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
    this.modalService.open(this.idleModal, {
      centered: true,
      backdrop: "static",
      ariaLabelledBy: "modal-title",
    });
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
