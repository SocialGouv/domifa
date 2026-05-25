import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { DsfrPaginationComponent } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Observable, Subscription } from "rxjs";

import { LOG_ACTION_LABELS, PageResults } from "@domifa/common";

import { CustomToastService } from "../../services";
import {
  getLogContextHumanSummary,
  getLogContextJson,
} from "../../../manage-users/types/log-context-formatter";
import { UserActivityLog } from "../../../manage-users/types/user-activity-log";

export type UserActivityLogsFetcher = (
  entityUuid: string,
  page: number,
  take: number
) => Observable<PageResults<UserActivityLog>>;

const PAGE_SIZE = 20;

@Component({
  selector: "app-user-activity-tab",
  templateUrl: "./user-activity-tab.component.html",
  imports: [CommonModule, DsfrPaginationComponent, DsfrSpinnerComponent],
})
export class UserActivityTabComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) public entityId!: string | undefined;
  @Input({ required: true }) public fetcher!: UserActivityLogsFetcher;
  @Input() public title = "Activité récente";
  @Input() public subtitle =
    "Liste des actions effectuées par cet utilisateur, du plus récent au plus ancien.";
  @Input() public emptyMessage =
    "Aucune activité enregistrée pour cet utilisateur.";
  @Input() public errorMessage =
    "Impossible de charger l'activité de l'utilisateur";

  public logs: UserActivityLog[] = [];
  public currentPage = 1;
  public totalPages = 1;
  public itemCount = 0;
  public loading = false;
  public readonly pageSize = PAGE_SIZE;

  private readonly subscription = new Subscription();

  constructor(private readonly toastService: CustomToastService) {}

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
    this.subscription.add(
      this.fetcher(this.entityId, page, this.pageSize).subscribe({
        next: (results) => {
          this.logs = results.data;
          this.currentPage = results.meta.page;
          this.totalPages = Math.max(1, results.meta.pageCount);
          this.itemCount = results.meta.itemCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.error(this.errorMessage);
        },
      })
    );
  }

  public onPageSelect(page: number): void {
    this.loadPage(page);
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
