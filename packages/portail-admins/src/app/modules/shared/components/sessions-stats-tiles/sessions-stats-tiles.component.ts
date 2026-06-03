import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { SessionsStats } from "@domifa/common";

import { AdminSecurityApiClient } from "../../services/api/admin-security-api-client.service";
import { CustomToastService } from "../../services";
import { StatCardComponent } from "../stat-card/stat-card.component";

@Component({
  selector: "app-sessions-stats-tiles",
  templateUrl: "./sessions-stats-tiles.component.html",
  imports: [CommonModule, DsfrSpinnerComponent, StatCardComponent],
})
export class SessionsStatsTilesComponent
  implements OnInit, OnChanges, OnDestroy
{
  // Omis = vue plateforme ; renseigné = scope structure.
  @Input() public structureId?: number;

  public stats: SessionsStats | null = null;
  public loading = false;
  public errored = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly api: AdminSecurityApiClient,
    private readonly toast: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.load();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["structureId"] && !changes["structureId"].firstChange) {
      this.load();
    }
  }

  public refresh(): void {
    this.load();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private load(): void {
    this.loading = true;
    this.errored = false;
    this.subscription.add(
      this.api.getSessionsStats(this.structureId).subscribe({
        next: (stats) => {
          this.stats = stats;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errored = true;
          this.toast.error(
            "Impossible de charger les statistiques de sessions"
          );
        },
      })
    );
  }
}
