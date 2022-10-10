import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  StructureDoc,
  UserStructure,
  STRUCTURE_DOC_ICONS,
  DOMIFA_CUSTOM_DOCS,
} from "../../../../../_common/model";

import { AuthService } from "../../../shared/services/auth.service";
import { StructureDocService } from "../../services/structure-doc.service";

@Component({
  selector: "app-structures-custom-docs",
  templateUrl: "./structures-custom-docs.component.html",
  styleUrls: ["./structures-custom-docs.component.css"],
})
export class StructuresCustomDocsComponent implements OnInit {
  public STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;

  // Documents simples
  public structureDocs: StructureDoc[];
  // Documents pré-remplis
  public customStructureDocs: StructureDoc[];

  public defaultStructureDocs: StructureDoc[];
  public me!: UserStructure;

  public isCustomDoc: boolean;

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
    this.titleService.setTitle("Gestion des documents de la structure");
    this.me = this.authService.currentUserValue;
    this.getAllStructureDocs();
  }

  public getAllStructureDocs(): void {
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
    });
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public openUploadCustomDocModal(isCustomDoc = false): void {
    this.isCustomDoc = isCustomDoc;
    this.modalService.open(this.uploadCustomDocModal);
  }
}
