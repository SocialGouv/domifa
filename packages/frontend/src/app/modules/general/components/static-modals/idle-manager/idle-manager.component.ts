import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserIdleService } from "angular-user-idle";
import { AuthService } from "../../../../shared/services";

@Component({
  selector: "app-idle-manager",
  templateUrl: "./idle-manager.component.html",
  styleUrls: ["./idle-manager.component.css"],
})
export class IdleManagerComponent implements OnInit {
  @ViewChild("idleModal", { static: true })
  public idleModal!: TemplateRef<NgbModalRef>;

  private timeoutBeforeRefresh: number;

  constructor(
    private readonly modalService: NgbModal,
    private readonly userIdleService: UserIdleService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userIdleService.onTimerStart().subscribe({
      next: () => {
        this.userIdleService.stopWatching();
        this.closeModals();
        this.openIdleModal();
        this.timeoutBeforeRefresh = window.setTimeout(() => {
          this.logout();
        }, 15000);
      },
    });
  }

  public cancelLogout(): void {
    this.closeModals();
    clearTimeout(this.timeoutBeforeRefresh);
    this.userIdleService.resetTimer();
  }

  public logout(): void {
    this.closeModals();
    clearTimeout(this.timeoutBeforeRefresh);
    this.authService.logoutAndRedirect(undefined, true);
  }

  public openIdleModal(): void {
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
