import { STRUCTURE_DOC_EXTENSIONS, UsagerDoc } from "src/_common/model";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerFormModel } from "../../interfaces";
import { DocumentService } from "../../services/document.service";
import { saveAs } from "file-saver";
import { Subscription } from "rxjs";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-display-usager-docs",
  templateUrl: "./display-usager-docs.component.html",
})
export class DisplayUsagerDocsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  @Input() public editPJ!: boolean;

  private subscription = new Subscription();
  public docs: UsagerDoc[];

  public loadings: {
    download: number[];
    delete: number[];
  };

  constructor(
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService
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

  public getUsagerDocs(): void {
    this.subscription.add(
      this.documentService.getUsagerDocs(this.usager.ref).subscribe({
        next: (docs: UsagerDoc[]) => {
          this.docs = docs;
        },
        error: () => {
          this.toastService.error("Impossible de d'afficher les documents");
        },
      })
    );
  }

  public getDocument(docIndex: number) {
    this.startLoading("download", docIndex);
    this.subscription.add(
      this.documentService
        .getDocument(this.usager.ref, this.docs[docIndex].uuid)
        .subscribe({
          next: (blob: Blob) => {
            const doc = this.docs[docIndex];
            const extension = STRUCTURE_DOC_EXTENSIONS[doc.filetype];
            const newBlob = new Blob([blob], { type: doc.filetype });

            saveAs(
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
        })
    );
  }

  public deleteDocument(docIndex: number): void {
    this.startLoading("delete", docIndex);
    this.subscription.add(
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
        })
    );
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

  private stopLoading(
    loadingType: "delete" | "download",
    loadingRef: number
  ): void {
    setTimeout(() => {
      const index = this.loadings[loadingType].indexOf(loadingRef);
      if (index !== -1) {
        this.loadings[loadingType].splice(index, 1);
      }
    }, 500);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
