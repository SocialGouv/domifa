import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DsfrPaginationComponent } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../../shared/constants";
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
  ],
})
export class BrevoBlocklistComponent implements OnInit, OnDestroy {
  public emails: string[] = [];
  public total: number | null = null;
  public currentPage = 1;
  public totalPages = 1;
  public loading = false;
  public unblockingEmail: string | null = null;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

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
          this.emails = results.data;
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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
