import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DsfrPaginationComponent } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import {
  BREVO_BLOCKED_CONTACT_REASON_LABELS,
  BrevoBlockedContact,
} from "@domifa/common";

import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../../shared/constants";
import { PageSizeSelectorComponent } from "../../../shared/components/page-size-selector/page-size-selector.component";
import { CustomToastService } from "../../../shared/services";
import { BrevoBlocklistService } from "../../services/brevo-blocklist.service";

@Component({
  selector: "app-brevo-blocklist",
  standalone: true,
  templateUrl: "./brevo-blocklist.component.html",
  imports: [
    CommonModule,
    FormsModule,
    DsfrPaginationComponent,
    DsfrSpinnerComponent,
    PageSizeSelectorComponent,
  ],
})
export class BrevoBlocklistComponent implements OnInit, OnDestroy {
  public contacts: BrevoBlockedContact[] = [];
  public total: number | null = null;
  public currentPage = 1;
  public totalPages = 1;
  public loading = false;
  public unblockingEmail: string | null = null;
  public resolvingLinkEmail: string | null = null;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  public readonly reasonLabels = BREVO_BLOCKED_CONTACT_REASON_LABELS;

  private readonly subscription = new Subscription();

  constructor(
    private readonly service: BrevoBlocklistService,
    private readonly toast: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.loadPage(1);
  }

  public loadPage(page: number): void {
    this.loading = true;
    this.subscription.add(
      this.service.list(page, this.pageSize).subscribe({
        next: (results) => {
          this.contacts = results.data;
          this.total = results.total;
          this.currentPage = page;
          this.totalPages =
            results.total !== null
              ? Math.max(1, Math.ceil(results.total / this.pageSize))
              : page;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.error(
            "Impossible de charger la liste des emails bloqués Brevo."
          );
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

  public unblock(email: string): void {
    if (this.unblockingEmail) {
      return;
    }
    this.unblockingEmail = email;
    this.subscription.add(
      this.service.unblock(email).subscribe({
        next: () => {
          this.unblockingEmail = null;
          this.toast.success(`${email} a été retiré de la blocklist.`);
          this.loadPage(this.currentPage);
        },
        error: () => {
          this.unblockingEmail = null;
          this.toast.error(`Échec du déblocage de ${email}.`);
        },
      })
    );
  }

  public openBrevoContact(email: string): void {
    if (this.resolvingLinkEmail) {
      return;
    }
    this.resolvingLinkEmail = email;
    this.subscription.add(
      this.service.resolveBrevoContactUrl(email).subscribe({
        next: ({ url }) => {
          this.resolvingLinkEmail = null;
          if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
          } else {
            this.toast.warning(
              `Aucune fiche Brevo trouvée pour ${email} (contact inexistant ou supprimé).`
            );
          }
        },
        error: () => {
          this.resolvingLinkEmail = null;
          this.toast.error(
            `Impossible de récupérer la fiche Brevo pour ${email}.`
          );
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
