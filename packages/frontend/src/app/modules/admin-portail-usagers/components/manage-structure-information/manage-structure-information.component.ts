import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";
import {
  STRUCTURE_INFORMATION_TYPES,
  StructureInformation,
} from "@domifa/common";
import { CustomToastService } from "../../../shared/services";
import { StructureInformationService } from "../../services/structure-information.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-manage-structure-information",
  templateUrl: "./manage-structure-information.component.html",
  styleUrls: ["./manage-structure-information.component.css"],
})
export class ManageStructureInformationComponent implements OnInit {
  @ViewChild("structureInformationEditorModal", { static: true })
  public structureInformationEditorModal!: TemplateRef<NgbModalRef>;

  @ViewChild("structureInformationDeleteConfirmationModal", { static: true })
  public structureInformationDeleteConfirmationModal!: TemplateRef<NgbModalRef>;

  public loading: boolean;
  public selectedStructureInformation: StructureInformation | null;
  public structureInformation: StructureInformation[];
  private subscription = new Subscription();

  public readonly STRUCTURE_INFORMATION_TYPES = STRUCTURE_INFORMATION_TYPES;

  constructor(
    private readonly modalService: NgbModal,
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
    if (structureInformation) {
      this.selectedStructureInformation = structureInformation;
    }
    this.modalService.open(
      this.structureInformationEditorModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public openDeleteConfirmation(structureInformation: StructureInformation) {
    this.selectedStructureInformation = structureInformation;
    this.modalService.open(
      this.structureInformationDeleteConfirmationModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public closeModals() {
    this.selectedStructureInformation = null;
    this.modalService.dismissAll();
  }

  public deleteStructureInformation() {
    this.subscription.add(
      this.structureInformationService
        .deleteStructureInformation(this.selectedStructureInformation.uuid)
        .subscribe({
          next: (structureInformation: StructureInformation[]) => {
            this.loading = false;
            this.structureInformation = structureInformation;
            this.getStructureInformation();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible de charger les informations");
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
