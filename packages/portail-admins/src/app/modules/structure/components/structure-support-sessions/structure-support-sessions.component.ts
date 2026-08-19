import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { SupportSession, SupportSessionRevokedReason } from "@domifa/common";

import { StructureService } from "../../services/structure.service";
import { CustomToastService } from "../../../shared/services";

const REVOKED_REASON_LABELS: Record<SupportSessionRevokedReason, string> = {
  MANUAL_REVOKE: "Révoquée manuellement",
  EXPIRED: "Expirée",
  REPLACED: "Remplacée par une nouvelle session",
  STRUCTURE_LOGOUT: "Déconnexion de la structure",
};

@Component({
  selector: "app-structure-support-sessions",
  templateUrl: "./structure-support-sessions.component.html",
  imports: [CommonModule, DsfrSpinnerComponent],
})
export class StructureSupportSessionsComponent implements OnInit, OnDestroy {
  public sessions: SupportSession[] = [];
  public loading = false;
  public loaded = false;

  private structureUuid?: string;
  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly structureService: StructureService,
    private readonly toastr: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.structureUuid = this.route.parent?.snapshot.params["structureUuid"];
    this.load();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public refresh(): void {
    this.load();
  }

  public revoke(session: SupportSession): void {
    if (!this.structureUuid) {
      return;
    }
    this.structureService
      .revokeSupportSession(this.structureUuid, session.uuid as string)
      .subscribe({
        next: () => {
          this.toastr.success("Session support révoquée");
          this.load();
        },
        error: () => {
          this.toastr.error("Impossible de révoquer la session");
        },
      });
  }

  public reasonLabel(reason: SupportSessionRevokedReason | null): string {
    if (!reason) {
      return "—";
    }
    return REVOKED_REASON_LABELS[reason] ?? reason;
  }

  private load(): void {
    if (!this.structureUuid) {
      return;
    }
    this.loading = true;
    this.subscription.add(
      this.structureService.getSupportSessions(this.structureUuid).subscribe({
        next: (sessions) => {
          this.sessions = sessions;
          this.loading = false;
          this.loaded = true;
        },
        error: () => {
          this.loading = false;
          this.toastr.error(
            "Impossible de charger les sessions support de la structure"
          );
        },
      })
    );
  }
}
