import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  AdminStructureStatsData,
  PortailAdminProfile,
} from "../../../../../_common";
import { INTERACTIONS_LABELS_PLURIEL } from "../../../../../_common/interaction";
import {
  DASHBOARD_STATUS_LABELS,
  STRUCTURE_TYPE_LABELS,
} from "../../../../../_common/usager/constants";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { REGIONS_LABELS_MAP } from "../../../shared/constants";
import { languagesAutocomplete } from "../../../shared/languages";
import { AdminStructuresApiClient } from "../../../shared/services";
import { AdminStructuresStatsVM, adminStructuresStatsVmBuilder } from "./vm";

@Component({
  selector: "app-admin-structures-stats",
  templateUrl: "./admin-structures-stats.component.html",
  styleUrls: ["./admin-structures-stats.component.css"],
})
export class AdminStructuresStatsComponent implements OnInit, OnDestroy {
  public adminProfile!: PortailAdminProfile | null;

  public data: AdminStructureStatsData | undefined = undefined;
  public stats: AdminStructuresStatsVM | undefined = undefined;

  private subscription = new Subscription();

  public REGIONS_LABELS_MAP = REGIONS_LABELS_MAP;
  public DASHBOARD_STATUS_LABELS = DASHBOARD_STATUS_LABELS;
  public INTERACTIONS_LABELS_PLURIEL = INTERACTIONS_LABELS_PLURIEL;
  public STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;

  public statutClass = {
    ATTENTE_DECISION: "text-warning",
    INSTRUCTION: "text-primary",
    RADIE: "text-danger",
    REFUS: "text-danger",
    VALIDE: "text-secondary",
  };

  public languagesAutocomplete = languagesAutocomplete;

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminStructuresApiClient: AdminStructuresApiClient
  ) {
    this.adminProfile = null;
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.adminAuthService.currentAdminSubject.subscribe(
        (apiResponse: PortailAdminProfile | null) => {
          this.adminProfile = apiResponse;
        }
      )
    );
    this.subscription.add(
      this.adminStructuresApiClient
        .getStatsDomifaAdminDashboard()
        .subscribe((data: AdminStructureStatsData) => {
          this.data = data;
          // build VM
          this.stats = adminStructuresStatsVmBuilder.buildViewModel(data);
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
