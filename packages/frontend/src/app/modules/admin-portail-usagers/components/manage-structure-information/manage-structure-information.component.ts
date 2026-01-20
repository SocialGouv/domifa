import { Component, OnInit, ViewChild } from "@angular/core";
import {
  STRUCTURE_INFORMATION_TYPES,
  StructureInformation,
} from "@domifa/common";
import { CustomToastService } from "../../../shared/services";
import { StructureInformationService } from "../../services/structure-information.service";
import { Subscription } from "rxjs";

import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-manage-structure-information",
  templateUrl: "./manage-structure-information.component.html",
  styleUrls: ["./manage-structure-information.component.css"],
})
export class ManageStructureInformationComponent implements OnInit {
  @ViewChild("editorModal") editorModal!: DsfrModalComponent;
  @ViewChild("deleteModal") deleteModal!: DsfrModalComponent;

  public loading: boolean;
  public selectedStructureInformation: StructureInformation | null;
  public structureInformation: StructureInformation[];
  private readonly subscription = new Subscription();

  public readonly STRUCTURE_INFORMATION_TYPES = STRUCTURE_INFORMATION_TYPES;

  constructor(
    private readonly structureInformationService: StructureInformationService,
    private readonly toastService: CustomToastService
  ) {
    this.loading = false;
    this.structureInformation = [];
    this.selectedStructureInformation = null;
  }

  ngOnInit(): void {
    this.getStructureInformation();
  }

  public openForm(structureInformation: StructureInformation | null) {
    this.selectedStructureInformation = structureInformation;
    this.editorModal.open();
  }

  public openDeleteConfirmation(structureInformation: StructureInformation) {
    this.selectedStructureInformation = structureInformation;
    this.deleteModal.open();
  }

  public closeModals() {
    this.selectedStructureInformation = null;
    if (this.editorModal) {
      this.editorModal.close();
    }
    if (this.deleteModal) {
      this.deleteModal.close();
    }
  }

  public deleteStructureInformation() {
    this.loading = true;
    this.subscription.add(
      this.structureInformationService
        .deleteStructureInformation(this.selectedStructureInformation!.uuid)
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastService.success("Information supprimée avec succès");
            this.getStructureInformation();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible de supprimer l'information");
          },
        })
    );
  }

  public getStructureInformation() {
    this.closeModals();
    this.subscription.add(
      this.structureInformationService.getAllStructureInformation().subscribe({
        next: (structureInformation: StructureInformation[]) => {
          this.loading = false;
          this.structureInformation = structureInformation;
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible de charger les informations");
        },
      })
    );
  }
}
