import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { DsfrPaginationComponent } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { CustomToastService } from "../../../shared/services";
import { DisplayUserAgentComponent } from "../../../shared/components/display-user-agent/display-user-agent.component";
import {
  getLogContextHumanSummary,
  getLogContextJson,
} from "../../../manage-users/types/log-context-formatter";
import { SecurityLogAction } from "@domifa/common";

import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../../shared/constants";
import {
  ACTION_BADGE_CLASS,
  resolveUserKindLabel,
  SUSPICIOUS_ACTION_LABELS,
} from "../../constants/SUSPICIOUS_ACTIONS.const";
import { SuspiciousActivityService } from "../../services/suspicious-activity.service";
import {
  SuspiciousActivityFilters,
  SuspiciousActivityLog,
  SuspiciousResolvedUser,
} from "../../types/suspicious-activity-log";
import { SuspiciousActivityFiltersComponent } from "../suspicious-activity-filters/suspicious-activity-filters.component";

@Component({
  selector: "app-suspicious-activity-list",
  standalone: true,
  templateUrl: "./suspicious-activity-list.component.html",
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DisplayUserAgentComponent,
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
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  public readonly userKindLabel = resolveUserKindLabel;
  public readonly encodeURIComponent = encodeURIComponent;

  @ViewChild(SuspiciousActivityFiltersComponent)
  private readonly filtersComponent?: SuspiciousActivityFiltersComponent;

  private currentFilters: SuspiciousActivityFilters = {};
  private readonly subscription = new Subscription();
  // Holds the in-flight load so a new search cancels the previous one. Without
  // it, two quick "Rechercher" clicks raced and the older response could
  // overwrite the newer (= "search works one click out of two" symptom).
  private loadSubscription?: Subscription;

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
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = this.service
      .list(this.currentFilters, page, this.pageSize)
      .subscribe({
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
      });
    this.subscription.add(this.loadSubscription);
  }

  public onPageSelect(page: number): void {
    this.loadPage(page);
  }

  public onPageSizeChange(value: number): void {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0 || next === this.pageSize) {
      return;
    }
    this.pageSize = next;
    this.loadPage(1);
  }

  public onIpClick(ip: string | null | undefined): void {
    if (!ip) {
      return;
    }
    // Delegate to the filter component so the form input mirrors the active
    // filter. setIp() emits filtersChange, which triggers loadPage(1).
    if (this.filtersComponent) {
      this.filtersComponent.setIp(ip);
      return;
    }
    // Embedded mode (no filters component) — apply the filter directly.
    this.currentFilters = {
      ...this.currentFilters,
      ip,
      ...this.lockedFilters,
    };
    this.loadPage(1);
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

  public userDetailLink(
    user: SuspiciousResolvedUser
  ): (string | number)[] | null {
    if (!user.uuid) {
      return null;
    }
    if (user.userType === "user_supervisor") {
      return ["/manage-users", user.uuid];
    }
    if (user.userType === "user_structure") {
      return ["/manage-structure-users", user.uuid];
    }
    // No admin detail page for usagers — render plain text instead.
    return null;
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
