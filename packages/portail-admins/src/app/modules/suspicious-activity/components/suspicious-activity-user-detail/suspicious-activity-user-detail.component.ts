import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription, forkJoin } from "rxjs";

import { CustomToastService } from "../../../shared/services";
import { DisplayLastLoginComponent } from "../../../shared/components/display-last-login/display-last-login.component";
import { SuspiciousActivityService } from "../../services/suspicious-activity.service";
import {
  SecurityUserSummary,
  SuspiciousUserProfile,
  UserSessionsView,
} from "../../types/suspicious-activity-log";
import { SessionsHistoryTableComponent } from "../sessions-history-table/sessions-history-table.component";
import { SuspiciousActivityListComponent } from "../suspicious-activity-list/suspicious-activity-list.component";

@Component({
  selector: "app-suspicious-activity-user-detail",
  standalone: true,
  templateUrl: "./suspicious-activity-user-detail.component.html",
  imports: [
    CommonModule,
    RouterLink,
    DsfrSpinnerComponent,
    DisplayLastLoginComponent,
    SessionsHistoryTableComponent,
    SuspiciousActivityListComponent,
  ],
})
export class SuspiciousActivityUserDetailComponent
  implements OnInit, OnDestroy
{
  public user?: SecurityUserSummary;
  public sessions?: UserSessionsView;
  public loading = true;
  public userType?: SuspiciousUserProfile;
  public userId?: number;

  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: SuspiciousActivityService,
    private readonly toast: CustomToastService
  ) {}

  public ngOnInit(): void {
    const userType = this.route.snapshot.paramMap.get("userType");
    const userIdParam = this.route.snapshot.paramMap.get("userId");
    if (
      (userType !== "user_structure" && userType !== "user_supervisor") ||
      !userIdParam
    ) {
      this.loading = false;
      return;
    }
    const userId = Number(userIdParam);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.loading = false;
      return;
    }
    this.userType = userType;
    this.userId = userId;

    this.subscription.add(
      forkJoin({
        user: this.service.getUserSummary(userType, userId),
        sessions: this.service.getUserSessions(userType, userId),
      }).subscribe({
        next: ({ user, sessions }) => {
          this.user = user;
          this.sessions = sessions;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.error("Impossible de charger la fiche utilisateur.");
        },
      })
    );
  }

  public profileLabel(profile: SuspiciousUserProfile): string {
    return profile === "user_supervisor" ? "Superviseur" : "Structure";
  }

  public toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    return value instanceof Date ? value : new Date(value);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
