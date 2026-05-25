import { CommonModule } from "@angular/common";
import { Component, Input, ViewChild } from "@angular/core";
import { DsfrModalComponent, DsfrModalModule } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { AdminUsersApiClient } from "../../services/api/admin-users-api-client.service";
import { CustomToastService } from "../../services/custom-toast.service";
import {
  SESSION_CLOSED_REASON_LABELS,
  SessionsUserProfile,
  UserSessionsView,
} from "./user-sessions.types";

@Component({
  selector: "app-user-sessions-modal",
  standalone: true,
  templateUrl: "./user-sessions-modal.component.html",
  imports: [CommonModule, DsfrModalModule, DsfrSpinnerComponent],
})
export class UserSessionsModalComponent {
  @Input({ required: true }) public dialogId!: string;
  @Input({ required: true }) public userType!: SessionsUserProfile;
  @Input({ required: true }) public userId!: number;
  @Input() public titleModal = "Sessions de l'utilisateur";

  @ViewChild("sessionsModal") public modal?: DsfrModalComponent;

  public sessions?: UserSessionsView;
  public loading = false;
  public loaded = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly api: AdminUsersApiClient,
    private readonly toast: CustomToastService
  ) {}

  public open(): void {
    this.modal?.open();
    if (!this.loaded) {
      this.load();
    }
  }

  public close(): void {
    this.modal?.close();
  }

  public refresh(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.subscription.add(
      this.api.getUserSessions(this.userType, this.userId).subscribe({
        next: (data) => {
          this.sessions = data;
          this.loading = false;
          this.loaded = true;
        },
        error: () => {
          this.loading = false;
          this.toast.error("Impossible de charger les sessions");
        },
      })
    );
  }

  public reasonLabel(reason: string): string {
    return SESSION_CLOSED_REASON_LABELS[reason] ?? reason;
  }

  public truncate(value: string | null | undefined, len = 12): string {
    if (!value) {
      return "—";
    }
    return value.length > len ? value.slice(0, len) + "…" : value;
  }
}
