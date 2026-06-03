import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import {
  DsfrButtonComponent,
  DsfrButtonsGroupModule,
  DsfrModalComponent,
  DsfrModalModule,
} from "@edugouvfr/ngx-dsfr";
import { Subscription } from "rxjs";

import {
  BREVO_EMAIL_EVENT_LABELS,
  BREVO_EMAIL_EVENT_TYPES,
  BrevoContactStatus,
  BrevoEmailEvent,
  BrevoEmailEventType,
} from "@domifa/common";

import { CustomToastService } from "../../services";
import { DisplayIpComponent } from "../display-ip/display-ip.component";
import {
  brevoEventBadgeClass,
  BREVO_TAB_PAGE_SIZE,
} from "./user-brevo-tab.constants";
import {
  BrevoEventsFetcher,
  BrevoStatusFetcher,
  BrevoUnblockFetcher,
} from "./user-brevo-tab.types";

@Component({
  selector: "app-user-brevo-tab",
  templateUrl: "./user-brevo-tab.component.html",
  imports: [
    CommonModule,
    FormsModule,
    DisplayIpComponent,
    DsfrSpinnerComponent,
    DsfrModalModule,
    DsfrButtonsGroupModule,
    DsfrButtonComponent,
  ],
})
export class UserBrevoTabComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) public entityUuid!: string | undefined;
  @Input({ required: true }) public statusFetcher!: BrevoStatusFetcher;
  @Input({ required: true }) public eventsFetcher!: BrevoEventsFetcher;
  @Input({ required: true }) public unblockFetcher!: BrevoUnblockFetcher;

  public status: BrevoContactStatus | null = null;
  public statusLoading = false;
  public unblocking = false;

  public brevoContactUrl: string | null = null;

  public events: BrevoEmailEvent[] = [];
  public loading = false;
  public loadingMore = false;
  public hasMore = false;
  public eventFilter: BrevoEmailEventType | "" = "";
  public daysFilter: number | null = 30;

  public readonly availableEvents = BREVO_EMAIL_EVENT_TYPES;
  public readonly eventLabels = BREVO_EMAIL_EVENT_LABELS;
  public readonly badgeClass = brevoEventBadgeClass;

  private readonly subscription = new Subscription();

  constructor(private readonly toastService: CustomToastService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["entityUuid"] && this.entityUuid) {
      this.refreshStatus();
      this.reload();
    }
  }

  public refreshStatus(): void {
    if (!this.entityUuid) {
      return;
    }
    this.statusLoading = true;
    this.subscription.add(
      this.statusFetcher(this.entityUuid).subscribe({
        next: (status) => {
          this.status = status;
          this.brevoContactUrl =
            status.existsInBrevo && status.id
              ? `https://app.brevo.com/contact/index/${status.id}`
              : null;
          this.statusLoading = false;
        },
        error: () => {
          this.statusLoading = false;
          this.toastService.error(
            "Impossible de récupérer le statut Brevo du contact"
          );
        },
      })
    );
  }

  public askUnblock(
    _kind: "transactional",
    confirmModal: DsfrModalComponent
  ): void {
    confirmModal.open();
  }

  public unblockBrevo(confirmModal: DsfrModalComponent): void {
    if (!this.entityUuid) {
      return;
    }
    this.unblocking = true;
    this.subscription.add(
      this.unblockFetcher(this.entityUuid, "transactional").subscribe({
        next: () => {
          this.unblocking = false;
          confirmModal.close();
          this.toastService.success(
            "Contact retiré de la blocklist transactionnelle Brevo"
          );
          this.refreshStatus();
          this.reload();
        },
        error: () => {
          this.unblocking = false;
          this.toastService.error(
            "Impossible de débloquer le contact côté transactionnel"
          );
        },
      })
    );
  }

  public reload(): void {
    if (!this.entityUuid) {
      return;
    }
    this.loading = true;
    this.events = [];
    this.subscription.add(
      this.eventsFetcher(this.entityUuid, {
        limit: BREVO_TAB_PAGE_SIZE,
        offset: 0,
        event: this.eventFilter || undefined,
        days: this.daysFilter ?? undefined,
      }).subscribe({
        next: (events) => {
          this.events = events;
          this.hasMore = events.length === BREVO_TAB_PAGE_SIZE;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible de charger les événements Brevo");
        },
      })
    );
  }

  public loadMore(): void {
    if (!this.entityUuid || this.loadingMore) {
      return;
    }
    this.loadingMore = true;
    this.subscription.add(
      this.eventsFetcher(this.entityUuid, {
        limit: BREVO_TAB_PAGE_SIZE,
        offset: this.events.length,
        event: this.eventFilter || undefined,
        days: this.daysFilter ?? undefined,
      }).subscribe({
        next: (events) => {
          this.events = [...this.events, ...events];
          this.hasMore = events.length === BREVO_TAB_PAGE_SIZE;
          this.loadingMore = false;
        },
        error: () => {
          this.loadingMore = false;
          this.toastService.error("Impossible de charger les événements Brevo");
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
