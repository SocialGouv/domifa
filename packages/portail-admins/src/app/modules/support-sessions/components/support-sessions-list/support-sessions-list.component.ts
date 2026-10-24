import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import {
  SUPPORT_SESSION_REVOKED_REASON_LABELS,
  SUPPORT_SESSION_STATUS_LABELS,
  SupportSessionHistoryItem,
} from "@domifa/common";

import { CustomToastService } from "../../../shared/services";
import { SupportSessionsService } from "../../services/support-sessions.service";

@Component({
  selector: "app-support-sessions-list",
  standalone: true,
  templateUrl: "./support-sessions-list.component.html",
  imports: [CommonModule, FormsModule, DsfrSpinnerComponent],
})
export class SupportSessionsListComponent implements OnInit, OnDestroy {
  public sessions: SupportSessionHistoryItem[] = [];
  public loading = false;
  public loaded = false;
  // "YYYY-MM-DD" values bound to the date inputs.
  public startDateFrom = "";
  public startDateTo = "";
  public readonly statusLabels = SUPPORT_SESSION_STATUS_LABELS;
  public readonly revokedReasonLabels = SUPPORT_SESSION_REVOKED_REASON_LABELS;

  private readonly subscription = new Subscription();

  constructor(
    private readonly service: SupportSessionsService,
    private readonly toast: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.load();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public applyFilters(): void {
    this.load();
  }

  public resetFilters(): void {
    this.startDateFrom = "";
    this.startDateTo = "";
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.subscription.add(
      this.service
        .list({
          // Local day bounds, so the filter matches the admin's calendar day.
          startDateFrom: this.startDateFrom
            ? new Date(`${this.startDateFrom}T00:00:00`)
            : undefined,
          startDateTo: this.startDateTo
            ? new Date(`${this.startDateTo}T23:59:59.999`)
            : undefined,
        })
        .subscribe({
          next: (sessions) => {
            this.sessions = sessions;
            this.loading = false;
            this.loaded = true;
          },
          error: () => {
            this.loading = false;
            this.toast.error("Impossible de charger les sessions support");
          },
        })
    );
  }
}
