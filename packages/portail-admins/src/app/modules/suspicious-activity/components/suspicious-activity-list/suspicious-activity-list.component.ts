import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DsfrPaginationComponent } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { CustomToastService } from "../../../shared/services";
import {
  getLogContextHumanSummary,
  getLogContextJson,
} from "../../../manage-users/types/log-context-formatter";
import { SecurityLogAction } from "@domifa/common";

import {
  ACTION_BADGE_CLASS,
  SUSPICIOUS_ACTION_LABELS,
} from "../../constants/SUSPICIOUS_ACTIONS.const";
import { SuspiciousActivityService } from "../../services/suspicious-activity.service";
import {
  SuspiciousActivityFilters,
  SuspiciousActivityLog,
  SuspiciousResolvedUser,
} from "../../types/suspicious-activity-log";
import { SuspiciousActivityFiltersComponent } from "../suspicious-activity-filters/suspicious-activity-filters.component";

const PAGE_SIZE = 25;

@Component({
  selector: "app-suspicious-activity-list",
  standalone: true,
  templateUrl: "./suspicious-activity-list.component.html",
  imports: [
    CommonModule,
    RouterLink,
    DsfrPaginationComponent,
    DsfrSpinnerComponent,
    SuspiciousActivityFiltersComponent,
  ],
})
export class SuspiciousActivityListComponent implements OnInit, OnDestroy {
  // When set, the list is rendered in "embedded" mode for a user fiche:
  // filters are hidden and locked to this user.
  @Input() public lockedFilters?: SuspiciousActivityFilters;
  @Input() public showFilters = true;
  @Input() public title = "Activité suspecte";

  public logs: SuspiciousActivityLog[] = [];
  public itemCount = 0;
  public totalPages = 1;
  public currentPage = 1;
  public loading = false;
  public readonly pageSize = PAGE_SIZE;

  private currentFilters: SuspiciousActivityFilters = {};
  private readonly subscription = new Subscription();

  constructor(
    private readonly service: SuspiciousActivityService,
    private readonly toast: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.currentFilters = { ...(this.lockedFilters ?? {}) };
    this.loadPage(1);
  }

  public onFiltersChange(filters: SuspiciousActivityFilters): void {
    this.currentFilters = { ...filters, ...(this.lockedFilters ?? {}) };
    this.loadPage(1);
  }

  public loadPage(page: number): void {
    this.loading = true;
    this.subscription.add(
      this.service.list(this.currentFilters, page, this.pageSize).subscribe({
        next: (results) => {
          this.logs = results.data;
          this.currentPage = results.meta.page;
          this.totalPages = Math.max(1, results.meta.pageCount);
          this.itemCount = results.meta.itemCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.error("Impossible de charger les événements de sécurité.");
        },
      })
    );
  }

  public onPageSelect(page: number): void {
    this.loadPage(page);
  }

  public actionLabel(action: SecurityLogAction): string {
    return SUSPICIOUS_ACTION_LABELS[action] ?? action;
  }

  public actionBadgeClass(action: SecurityLogAction): string {
    return ACTION_BADGE_CLASS[action] ?? "fr-badge--info";
  }

  public contextHuman(action: string, context: unknown): string {
    return getLogContextHumanSummary(action, context);
  }

  public contextJson(context: unknown): string {
    return getLogContextJson(context);
  }

  public userDetailLink(user: SuspiciousResolvedUser): (string | number)[] {
    const base =
      user.userType === "user_supervisor"
        ? "/manage-users"
        : "/manage-structure-users";
    return [base, user.uuid as string];
  }

  public contextString(
    context: Record<string, unknown> | null,
    key: string
  ): string {
    if (!context) {
      return "—";
    }
    const value = context[key];
    return typeof value === "string" && value.length > 0 ? value : "—";
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
