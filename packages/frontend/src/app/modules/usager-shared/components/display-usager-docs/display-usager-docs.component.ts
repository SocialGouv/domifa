import {
  STRUCTURE_DOC_EXTENSIONS,
  STRUCTURE_DOC_EXTENSIONS_LABELS,
  UsagerDoc,
} from "src/_common/model";
import { Component, Input, OnInit } from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { STRUCTURE_DOC_ICONS } from "../../../../../_common/model";
import { UsagerFormModel } from "../../interfaces";
import { DocumentService } from "../../services/document.service";
import fileSaver from "file-saver";
import { User } from "@sentry/browser";

@Component({
  selector: "app-display-usager-docs",
  templateUrl: "./display-usager-docs.component.html",
  styleUrls: ["./display-usager-docs.component.css"],
})
export class DisplayUsagerDocsComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: User;
  @Input() public editPJ!: boolean;

  public docs: UsagerDoc[];
  public STRUCTURE_DOC_EXTENSIONS_LABELS = STRUCTURE_DOC_EXTENSIONS_LABELS;
  public STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;

  public loadings: {
    download: number[];
    delete: number[];
  };

  constructor(
    private documentService: DocumentService,
    private toastService: CustomToastService
  ) {
    this.loadings = {
      download: [],
      delete: [],
    };
    this.docs = [];
  }

  public ngOnInit(): void {
    this.getUsagerDocs();
  }

  public getUsagerDocs() {
    this.documentService.getUsagerDocs(this.usager.ref).subscribe({
      next: (docs: UsagerDoc[]) => {
        this.docs = docs;
      },
      error: () => {
        this.toastService.error("Impossible de d'afficher les documents");
      },
    });
  }

  public getDocument(docIndex: number) {
    this.startLoading("download", docIndex);

    this.documentService
      .getDocument(this.usager.ref, this.docs[docIndex].uuid)
      .subscribe({
        next: (blob: Blob) => {
          const doc = this.docs[docIndex];
          const extension = STRUCTURE_DOC_EXTENSIONS[doc.filetype];
          const newBlob = new Blob([blob], { type: doc.filetype });

          fileSaver.saveAs(
            newBlob,
            this.slugLabel(doc.label) +
              "_" +
              this.slugLabel(this.usager.nom + " " + this.usager.prenom) +
              extension
          );
          this.stopLoading("download", docIndex);
        },
        error: () => {
          this.toastService.error("Impossible de télécharger le fichier");
          this.stopLoading("download", docIndex);
        },
      });
  }

  public deleteDocument(docIndex: number): void {
    this.startLoading("delete", docIndex);

    this.documentService
      .deleteDocument(this.usager.ref, this.docs[docIndex].uuid)
      .subscribe({
        next: (docs: UsagerDoc[]) => {
          this.docs = docs;
          this.stopLoading("delete", docIndex);
          this.toastService.success("Document supprimé avec succès");
        },
        error: () => {
          this.stopLoading("delete", docIndex);
          this.toastService.error("Impossible de supprimer le document");
        },
      });
  }

  private slugLabel(docName: string): string {
    docName = docName.trim().toLowerCase();
    docName = docName.replace(/\W/g, "_");
    docName = docName.replace(/-+/g, "_");
    docName = docName.replace("_l_", "_");
    docName = docName.replace("_d_", "_");
    docName = docName.replace("_a_", "_");
    docName = docName.replace("_n_", "_");
    docName = docName.replace(/__/g, "_");
    return docName;
  }

  private startLoading(
    loadingType: "delete" | "download",
    loadingRef: number
  ): void {
    this.loadings[loadingType].push(loadingRef);
  }

  private focusDeleteDoc(index: number): void {
    // Par défaut on va au dernier point du tablea
    let newIndexToFocus = this.docs.length - 1;

    // S'il reste des éléments dans le tableaux, on focus sur le suivant
    if (index < newIndexToFocus) {
      newIndexToFocus = index;
    }
  }

  private stopLoading(
    loadingType: "delete" | "download",
    loadingRef: number
  ): void {
    setTimeout(() => {
      const index = this.loadings[loadingType].indexOf(loadingRef);
      if (index !== -1) {
        this.loadings[loadingType].splice(index, 1);
      }

      if (loadingType === "delete") {
        this.focusDeleteDoc(loadingRef);
      }
    }, 500);
  }
}
