import { Component } from "@angular/core";
import { saveAs } from "file-saver";

import { AdminStructuresApiClient } from "../../services";

import { CustomToastService } from "../../services/custom-toast.service";

@Component({
  selector: "app-admin-structures-export",
  templateUrl: "./admin-structures-export.component.html",
})
export class AdminStructuresExportComponent {
  public exportLoading = false;

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly notifService: CustomToastService
  ) {}

  public exportDashboard(): void {
    this.exportLoading = true;
    this.adminStructuresApiClient.exportDashboard().subscribe({
      next: (x: Blob) => {
        const newBlob = new Blob([x], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(newBlob, "export_stats_domifa" + ".xlsx");
        setTimeout(() => {
          this.exportLoading = false;
        }, 2000);
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
