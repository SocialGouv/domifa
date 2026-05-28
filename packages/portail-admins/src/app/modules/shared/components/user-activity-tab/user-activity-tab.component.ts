import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DsfrPaginationComponent } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Observable, Subscription } from "rxjs";

import { LOG_ACTION_LABELS, PageResults } from "@domifa/common";

import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../../shared/constants";
import { CustomToastService } from "../../services";
import { DisplayIpComponent } from "../display-ip/display-ip.component";
import { DisplayUserAgentComponent } from "../display-user-agent/display-user-agent.component";
import {
  getLogContextHumanSummary,
  getLogContextJson,
} from "../../../manage-users/types/log-context-formatter";
import { UserActivityLog } from "../../../manage-users/types/user-activity-log";

export type UserTypeFilter = "all" | "user_structure" | "usager";

export type UserActivityLogsFetcher = (
  entityUuid: string,
  page: number,
  take: number,
  userType?: string
) => Observable<PageResults<UserActivityLog>>;

// `activity` = rows from `app_log` (no IP/UA columns)
// `security` = rows from `app_log_security` (IP + User-Agent shown as columns)
export type UserActivityTabVariant = "activity" | "security";

// Default labels per variant. Titles match the portail-admins tab naming so
// the panel header stays in sync with the tab the user clicked through.
const DEFAULT_TEXTS: Record<
  UserActivityTabVariant,
  {
    title: string;
    subtitle: string;
    emptyMessage: string;
    errorMessage: string;
  }
> = {
  activity: {
    title: "Suivi de l'activité",
    subtitle:
      "Liste des actions effectuées par cet utilisateur, du plus récent au plus ancien.",
    emptyMessage: "Aucune activité enregistrée pour cet utilisateur.",
    errorMessage: "Impossible de charger l'activité de l'utilisateur",
  },
  security: {
    title: "Suivi sécurité",
    subtitle:
      "Événements de sécurité enregistrés pour cet utilisateur (connexions, OTP, blocages, etc.).",
    emptyMessage:
      "Aucun événement de sécurité enregistré pour cet utilisateur.",
    errorMessage: "Impossible de charger le suivi sécurité",
  },
};

@Component({
  selector: "app-user-activity-tab",
  templateUrl: "./user-activity-tab.component.html",
  imports: [
    CommonModule,
    FormsModule,
    DsfrPaginationComponent,
    DsfrSpinnerComponent,
    DisplayIpComponent,
    DisplayUserAgentComponent,
  ],
})
export class UserActivityTabComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) public entityId!: string | undefined;
  @Input({ required: true }) public fetcher!: UserActivityLogsFetcher;
  @Input() public variant: UserActivityTabVariant = "activity";
  // When true, an extra "Utilisateur" column is shown (used on structure-
  // level views that aggregate the activity of every user in the structure).
  @Input() public showUserColumn = false;
  // When true, render a "Structures / Usagers / Tous" selector on top of the
  // table. The selected value is passed to the fetcher as the 4th argument.
  @Input() public showUserTypeFilter = false;
  @Input() public title?: string;
  @Input() public subtitle?: string;
  @Input() public emptyMessage?: string;
  @Input() public errorMessage?: string;

  public userTypeFilter: UserTypeFilter = "all";

  public logs: UserActivityLog[] = [];
  public currentPage = 1;
  public totalPages = 1;
  public itemCount = 0;
  public loading = false;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  private readonly subscription = new Subscription();

  constructor(private readonly toastService: CustomToastService) {}

  public get resolvedTitle(): string {
    return this.title ?? DEFAULT_TEXTS[this.variant].title;
  }

  public get resolvedSubtitle(): string {
    return this.subtitle ?? DEFAULT_TEXTS[this.variant].subtitle;
  }

  public get resolvedEmptyMessage(): string {
    return this.emptyMessage ?? DEFAULT_TEXTS[this.variant].emptyMessage;
  }

  public get resolvedErrorMessage(): string {
    return this.errorMessage ?? DEFAULT_TEXTS[this.variant].errorMessage;
  }

  public get showNetworkColumns(): boolean {
    return this.variant === "security";
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["entityId"] && this.entityId) {
      this.loadPage(1);
    }
  }

  public loadPage(page: number): void {
    if (!this.entityId) {
      return;
    }
    this.loading = true;
    const userTypeArg =
      this.userTypeFilter === "all" ? undefined : this.userTypeFilter;
    this.subscription.add(
      this.fetcher(this.entityId, page, this.pageSize, userTypeArg).subscribe({
        next: (results) => {
          this.logs = results.data;
          this.currentPage = results.meta.page;
          this.totalPages = Math.max(1, results.meta.pageCount);
          this.itemCount = results.meta.itemCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.error(this.resolvedErrorMessage);
        },
      })
    );
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

  public onUserTypeFilterChange(): void {
    this.loadPage(1);
  }

  public actionLabel(action: string): string {
    return (
      LOG_ACTION_LABELS[action as keyof typeof LOG_ACTION_LABELS] ?? action
    );
  }

  public contextHuman(action: string, context: unknown): string {
    return getLogContextHumanSummary(action, context);
  }

  public contextJson(context: unknown): string {
    return getLogContextJson(context);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
