import { Component, Input, OnInit } from "@angular/core";
import * as fileSaver from "file-saver";
import {
  StructureDoc,
  StructureDocTypesAvailable,
  STRUCTURE_DOC_ICONS,
} from "../../../../../_common/model/structure-doc";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DocumentService } from "../../../usager-shared/services/document.service";

@Component({
  selector: "app-profil-structure-docs",
  styleUrls: ["./profil-structure-docs.component.css"],
  templateUrl: "./profil-structure-docs.component.html",
})
export class ProfilStructureDocsComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;

  public customStructureDocs: StructureDoc[];
  public STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;

  // Frontend variables
  public loadings: string[];

  constructor(private documentService: DocumentService) {
    this.customStructureDocs = [];
    this.loadings = [];
  }

  public ngOnInit(): void {
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
          this.stopLoading(structureDoc.uuid);
        },
      });
  }

  public getAllStructureDocs(): void {
    this.documentService.getAllStructureDocs().subscribe({
      next: (structureDocs: StructureDoc[]) => {
        this.customStructureDocs = structureDocs.filter(
          (structureDoc) =>
            structureDoc.custom &&
            structureDoc.customDocType !== "attestation_postale" &&
            structureDoc.customDocType !== "courrier_radiation"
        );
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
