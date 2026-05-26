import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { StructureSessionRecord } from "@domifa/common";

import { AdminStructuresApiClient } from "../../../shared/services/api/admin-structures-api-client.service";
import { CustomToastService } from "../../../shared/services";
import { SESSION_CLOSED_REASON_LABELS } from "../../../shared/components/user-sessions-tab/user-sessions.types";

@Component({
  selector: "app-structure-sessions",
  templateUrl: "./structure-sessions.component.html",
  imports: [CommonModule, DsfrSpinnerComponent],
})
export class StructureSessionsComponent implements OnInit, OnDestroy {
  public sessions: StructureSessionRecord[] = [];
  public loading = false;
  public loaded = false;

  private structureUuid?: string;
  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: AdminStructuresApiClient,
    private readonly toast: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.structureUuid = this.route.parent?.snapshot.params["structureUuid"];
    this.load();
  }

  public refresh(): void {
    this.load();
  }

  public reasonLabel(reason?: string): string {
    if (!reason) {
      return "—";
    }
    return SESSION_CLOSED_REASON_LABELS[reason] ?? reason;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private load(): void {
    if (!this.structureUuid) {
      return;
    }
    this.loading = true;
    this.subscription.add(
      this.api.getStructureSessions(this.structureUuid).subscribe({
        next: (sessions) => {
          this.sessions = sessions;
          this.loading = false;
          this.loaded = true;
        },
        error: () => {
          this.loading = false;
          this.toast.error(
            "Impossible de charger les sessions de la structure"
          );
        },
      })
    );
  }
}
