import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { AdminUsersApiClient } from "../../services/api/admin-users-api-client.service";
import { CustomToastService } from "../../services/custom-toast.service";
import { DisplayIpComponent } from "../display-ip/display-ip.component";
import { DisplayUserAgentComponent } from "../display-user-agent/display-user-agent.component";
import {
  SESSION_CLOSED_REASON_LABELS,
  SessionsUserProfile,
  UserSessionsView,
} from "./user-sessions.types";

@Component({
  selector: "app-user-sessions-tab",
  templateUrl: "./user-sessions-tab.component.html",
  imports: [
    CommonModule,
    DsfrSpinnerComponent,
    DisplayIpComponent,
    DisplayUserAgentComponent,
  ],
})
export class UserSessionsTabComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) public userType!: SessionsUserProfile;
  @Input({ required: true }) public userUuid!: string;

  public sessions?: UserSessionsView;
  public loading = false;
  public loaded = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly api: AdminUsersApiClient,
    private readonly toast: CustomToastService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes["userUuid"] || changes["userType"]) &&
      this.userUuid &&
      this.userType
    ) {
      this.load();
    }
  }

  public refresh(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.subscription.add(
      this.api.getUserSessions(this.userType, this.userUuid).subscribe({
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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
