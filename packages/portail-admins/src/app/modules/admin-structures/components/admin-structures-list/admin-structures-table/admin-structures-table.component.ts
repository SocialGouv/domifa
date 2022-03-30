import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  AdminStructuresApiClient,
  AdminStructuresExportApiClient,
} from "../../../../shared/services";
import { AdminStructuresDeleteApiClient } from "../../../../shared/services/api/admin-structures-delete-api-client.service";
import { CustomToastService } from "../../../../shared/services/custom-toast.service";
import {
  AdminStructuresListSortAttribute,
  AdminStructuresListStructureModel,
} from "../model";

@Component({
  selector: "app-admin-structures-table",
  templateUrl: "./admin-structures-table.component.html",
  styleUrls: ["./admin-structures-table.component.css"],
})
export class AdminStructuresTableComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input()
  public structuresVM?: AdminStructuresListStructureModel[] = [];

  @Output()
  public onSort = new EventEmitter<{
    name: AdminStructuresListSortAttribute;
    defaultSort: "asc" | "desc";
  }>();

  public exportLoading = false;

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly adminStructuresDeleteApiClient: AdminStructuresDeleteApiClient,
    private readonly adminStructuresExportApiClient: AdminStructuresExportApiClient,
    private notifService: CustomToastService
  ) {}

  public ngOnInit(): void {}

  public ngOnChanges(): void {}

  public ngOnDestroy(): void {}

  public sortDashboard(
    name: AdminStructuresListSortAttribute,
    defaultSort: "asc" | "desc" = "asc"
  ): void {
    this.onSort.emit({
      name,
      defaultSort,
    });
  }

  public deleteStructure(id: number): void {
    this.adminStructuresDeleteApiClient.deleteSendInitialMail(id).subscribe({
      next: () => {
        this.notifService.success(
          "Vous venez de recevoir un email vous permettant de supprimer la structure"
        );
      },
      error: () => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      },
    });
  }

  public enableSms(structure: AdminStructuresListStructureModel): void {
    this.adminStructuresApiClient.enableSms(structure.id).subscribe({
      next: () => {
        structure.sms.enabledByDomifa = !structure.sms.enabledByDomifa;

        let message = structure.portailUsager.enabledByDomifa
          ? "SMS activés"
          : "SMS désactivés";
        message = message + " pour la structure : " + structure.nom;
        this.notifService.success(message);
      },
      error: () => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      },
    });
  }
  public enablePortailUsager(
    structure: AdminStructuresListStructureModel
  ): void {
    this.adminStructuresApiClient.enablePortailUsager(structure.id).subscribe({
      next: () => {
        structure.portailUsager.enabledByDomifa =
          !structure.portailUsager.enabledByDomifa;

        let message = structure.sms.enabledByDomifa
          ? "Portail usager activé"
          : "Portail usager désactivé";
        message = message + " pour la structure : " + structure.nom;
        this.notifService.success(message);
      },
      error: () => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      },
    });
  }
  public exportYearStats(structureId: number, year: number): void {
    this.exportLoading = true;

    this.adminStructuresExportApiClient
      .exportYearStats({
        structureId,
        year,
      })
      .subscribe({
        error: () => {
          this.notifService.error(
            "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
          );
          this.exportLoading = false;
        },
        complete: () => {
          this.exportLoading = false;
        },
      });
  }
}
