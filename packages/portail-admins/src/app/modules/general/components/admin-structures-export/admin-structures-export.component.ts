import { Component, OnDestroy, OnInit } from "@angular/core";

import { AdminStructuresApiClient } from "../../../shared/services";
import * as fileSaver from "file-saver";
import { CustomToastService } from "../../../shared/services/custom-toast.service";

@Component({
  selector: "app-admin-structures-export",
  templateUrl: "./admin-structures-export.component.html",
  styleUrls: ["./admin-structures-export.component.css"],
})
export class AdminStructuresExportComponent implements OnInit, OnDestroy {
  public exportLoading = false;

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private notifService: CustomToastService
  ) {}

  public ngOnInit(): void {}

  public ngOnDestroy(): void {}

  public exportDashboard(): void {
    this.exportLoading = true;
    this.adminStructuresApiClient.exportDashboard().subscribe({
      next: (x: any) => {
        const newBlob = new Blob([x], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        fileSaver.saveAs(newBlob, "export_stats_domifa" + ".xlsx");
        setTimeout(() => {
          this.exportLoading = false;
        }, 500);
      },
      error: () => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
        this.exportLoading = false;
      },
    });
  }
}
