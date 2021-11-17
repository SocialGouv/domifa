import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import {
  StructureDoc,
  UserStructure,
  STRUCTURE_DOC_ICONS,
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
    private modalService: NgbModal
  ) {
    this.structureDocs = [];

    this.defaultStructureDocs = [
      {
        label: "Attestation postale",
        createdBy: {
          id: 0,
          nom: "Domifa",
          prenom: "Domifa",
        },
        tags: null,
        custom: true,
        filetype: "word",
        structureId: 0,
      },
    ];
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.getAllStructureDocs();
  }

  public getAllStructureDocs(): void {
    this.structureDocService.getAllStructureDocs().subscribe({
      next: (structureDocs: StructureDoc[]) => {
        this.customStructureDocs = structureDocs.filter(
          (structureDoc) => structureDoc.custom
        );

        if (
          !this.customStructureDocs.find(
            (element) => element.customDocType === "ATTESTATION_POSTALE"
          )
        ) {
          this.customStructureDocs.push({
            label: "Attestation postale",
            createdBy: {
              id: 0,
              nom: "Domifa",
              prenom: "Domifa",
            },
            tags: null,
            custom: true,
            filetype: "application/msword",

            structureId: 0,
          });
        }
        if (
          !this.customStructureDocs.find(
            (element) => element.customDocType === "COURRIER_RADIATION"
          )
        ) {
          this.customStructureDocs.push({
            label: "Courrier de radiation",
            createdBy: {
              id: 0,
              nom: "Domifa",
              prenom: "Domifa",
            },
            tags: null,
            custom: true,
            filetype: "application/msword",

            structureId: 0,
          });
        }

        this.structureDocs = structureDocs.filter(
          (structureDoc) => !structureDoc.custom
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
