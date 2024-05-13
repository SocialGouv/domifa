import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { PortailAdminProfile } from "../../../../../_common";

import { DASHBOARD_STATUS_LABELS } from "../../../../../_common/usager/constants";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";

import { AdminStructuresApiClient } from "../../../shared/services";

import { AdminStructuresStatsVM, adminStructuresStatsVmBuilder } from "./vm";
import {
  STRUCTURE_TYPE_LABELS,
  INTERACTIONS_LABELS_PLURIEL,
  AdminStructureStatsData,
  REGIONS_LISTE,
} from "@domifa/common";

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

  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public readonly DASHBOARD_STATUS_LABELS = DASHBOARD_STATUS_LABELS;
  public readonly INTERACTIONS_LABELS_PLURIEL = INTERACTIONS_LABELS_PLURIEL;
  public readonly STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;

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
          this.stats = adminStructuresStatsVmBuilder.buildViewModel(data);
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
