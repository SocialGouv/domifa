import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
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
  public me: UserStructure;

  public isCustomDoc: boolean;

  @ViewChild("uploadCustomDocModal", { static: true })
  public uploadCustomDocModal!: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private structureDocService: StructureDocService,
    private notifService: ToastrService,
    private modalService: NgbModal,
    private titleService: Title
  ) {
    this.structureDocs = [];

    this.defaultStructureDocs = DOMIFA_CUSTOM_DOCS;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gestion des documents de la structure");

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

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
        this.notifService.error("Impossible d'afficher les documents");
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
