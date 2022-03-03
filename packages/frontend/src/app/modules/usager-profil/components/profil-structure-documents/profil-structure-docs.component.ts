import { UserStructure } from "./../../../../../_common/model/user-structure/UserStructure.type";
import { Component, Input, OnInit } from "@angular/core";
import * as fileSaver from "file-saver";
import {
  StructureDoc,
  StructureDocTypesAvailable,
  STRUCTURE_DOC_ICONS,
} from "../../../../../_common/model/structure-doc";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";

@Component({
  selector: "app-profil-structure-docs",
  styleUrls: ["./profil-structure-docs.component.css"],
  templateUrl: "./profil-structure-docs.component.html",
})
export class ProfilStructureDocsComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public defaultStructureDocs: {
    attestation_postale?: StructureDoc;
    courrier_radiation?: StructureDoc;
  };

  public customStructureDocs: StructureDoc[];
  public STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;

  // Frontend variables
  public loadings: string[];

  constructor(
    private documentService: DocumentService,
    private toastService: CustomToastService
  ) {
    const defaultCustomDoc: StructureDoc = {
      createdBy: {
        id: null,
        nom: "Domifa",
        prenom: "",
      },
      custom: true,
      customDocType: "attestation_postale",
      createdAt: null,
      structureId: null,
      filetype:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      label: "",
    };

    this.defaultStructureDocs = {
      attestation_postale: defaultCustomDoc,
      courrier_radiation: defaultCustomDoc,
    };

    this.customStructureDocs = [];
    this.loadings = [];
  }

  public ngOnInit(): void {
    this.defaultStructureDocs.attestation_postale = {
      ...this.defaultStructureDocs.attestation_postale,
      createdAt: this.me.structure.createdAt,
      structureId: this.me.structureId,
      label: "Attestation postale",
      customDocType: "attestation_postale",
    };

    this.defaultStructureDocs.courrier_radiation = {
      ...this.defaultStructureDocs.courrier_radiation,
      createdAt: this.me.structure.createdAt,
      structureId: this.me.structureId,
      label: "Courrier de radiation",
      customDocType: "courrier_radiation",
    };

    this.getAllStructureDocs();
  }

  // Documents définis par Domifa
  public getDomifaCustomDoc(docType: StructureDocTypesAvailable): void {
    this.loadings.push(docType);

    this.documentService
      .getDomifaCustomDoc({
        usagerId: this.usager.ref,
        docType,
      })
      .subscribe({
        next: (blob: Blob) => {
          const newBlob = new Blob([blob], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          fileSaver.saveAs(newBlob, docType + ".docx");

          this.stopLoading(docType);
        },
        error: () => {
          this.toastService.error(
            "Impossible de télécharger le fichier pour l'instant"
          );
          this.stopLoading(docType);
        },
      });
  }

  // Documents personnalisables de la structure
  public getStructureCustomDoc(structureDoc: StructureDoc): void {
    this.documentService
      .getStructureCustomDoc(this.usager.ref, structureDoc.uuid)
      .subscribe({
        next: (blob: Blob) => {
          const newBlob = new Blob([blob], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          fileSaver.saveAs(newBlob, structureDoc.label + ".docx");
          this.stopLoading(structureDoc.uuid);
        },
        error: () => {
          this.toastService.error(
            "Impossible de télécharger le fichier pour l'instant"
          );
          this.stopLoading(structureDoc.uuid);
        },
      });
  }

  public getAllStructureDocs(): void {
    this.documentService.getAllStructureDocs().subscribe({
      next: (structureDocs: StructureDoc[]) => {
        structureDocs.forEach((structureDoc: StructureDoc) => {
          if (structureDoc.customDocType === "attestation_postale") {
            this.defaultStructureDocs.attestation_postale.createdBy =
              structureDoc.createdBy;
            this.defaultStructureDocs.attestation_postale.createdAt =
              structureDoc.createdAt;
          } else if (structureDoc.customDocType === "courrier_radiation") {
            this.defaultStructureDocs.courrier_radiation.createdBy =
              structureDoc.createdBy;
            this.defaultStructureDocs.courrier_radiation.createdAt =
              structureDoc.createdAt;
          } else {
            this.customStructureDocs.push(structureDoc);
          }
        });
      },
    });
  }

  private stopLoading(loadingRef: string) {
    const index = this.loadings.indexOf(loadingRef);
    if (index !== -1) {
      this.loadings.splice(index, 1);
    }
  }
}
