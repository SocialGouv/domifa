import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  DOMIFA_CUSTOM_DOCS,
  DEFAULT_MODAL_OPTIONS,
} from "../../../../../_common/model";

import { AuthService } from "../../../shared/services/auth.service";
import { StructureDocService } from "../../services/structure-doc.service";
import { StructureDoc, UserStructure } from "@domifa/common";

@Component({
  selector: "app-structures-custom-docs",
  templateUrl: "./structures-custom-docs.component.html",
})
export class StructuresCustomDocsComponent implements OnInit, OnDestroy {
  // Documents simples
  public structureDocs: StructureDoc[];
  // Documents pré-remplis
  public customStructureDocs: StructureDoc[];

  public defaultStructureDocs: StructureDoc[];
  public me!: UserStructure | null;

  public isCustomDoc: boolean;
  private subscription = new Subscription();

  @ViewChild("uploadCustomDocModal", { static: true })
  public uploadCustomDocModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly authService: AuthService,
    private readonly structureDocService: StructureDocService,
    private readonly toastService: CustomToastService,
    private readonly modalService: NgbModal,
    private readonly titleService: Title
  ) {
    this.structureDocs = [];
    this.customStructureDocs = [];
    this.isCustomDoc = false;
    this.defaultStructureDocs = DOMIFA_CUSTOM_DOCS;
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Gestion des documents de la structure - DomiFa"
    );
    this.me = this.authService.currentUserValue;
    this.getAllStructureDocs();
  }

  public getAllStructureDocs(): void {
    this.subscription.add(
      this.structureDocService.getAllStructureDocs().subscribe({
        next: (structureDocs: StructureDoc[]) => {
          this.structureDocs = structureDocs.filter(
            (structureDoc) => !structureDoc.custom
          );
          this.customStructureDocs = structureDocs.filter(
            (structureDoc) => structureDoc.custom
          );
        },
        error: () => {
          this.toastService.error("Impossible d'afficher les documents");
        },
      })
    );
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public openUploadCustomDocModal(isCustomDoc = false): void {
    this.isCustomDoc = isCustomDoc;
    this.modalService.open(this.uploadCustomDocModal, DEFAULT_MODAL_OPTIONS);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
