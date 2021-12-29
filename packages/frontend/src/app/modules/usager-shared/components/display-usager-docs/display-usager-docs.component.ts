import { UsagerDoc } from "src/_common/model";
import { Component, Input, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";

import { STRUCTURE_DOC_ICONS } from "../../../../../_common/model";
import { UsagerFormModel } from "../../interfaces";
import { DocumentService } from "../../services/document.service";
import * as fileSaver from "file-saver";

@Component({
  selector: "app-display-usager-docs",
  templateUrl: "./display-usager-docs.component.html",
  styleUrls: ["./display-usager-docs.component.css"],
})
export class DisplayUsagerDocsComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  public STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;

  public loadings: {
    download: number[];
    delete: number[];
  };

  constructor(
    private documentService: DocumentService,
    private notifService: ToastrService
  ) {
    this.loadings = {
      download: [],
      delete: [],
    };
  }

  public ngOnInit(): void {}

  public getDocument(i: number) {
    this.startLoading("download", i);

    this.documentService.getDocument(this.usager.ref, i).subscribe({
      next: (blob: Blob) => {
        const doc = this.usager.docs[i];
        const extension = doc.filetype.split("/")[1];
        const newBlob = new Blob([blob], { type: doc.filetype });

        fileSaver.saveAs(
          newBlob,
          this.slugLabel(doc.label) +
            "_" +
            this.slugLabel(this.usager.nom + " " + this.usager.prenom) +
            "." +
            extension
        );
        this.stopLoading("download", i);
      },
      error: () => {
        this.stopLoading("download", i);
        this.notifService.error("Impossible de télécharger le fichier");
      },
    });
  }

  public deleteDocument(i: number): void {
    this.startLoading("delete", i);

    this.documentService.deleteDocument(this.usager.ref, i).subscribe({
      next: (docs: UsagerDoc[]) => {
        this.usager.docs = docs;
        this.stopLoading("delete", i);
        this.notifService.success("Document supprimé avec succès");
      },
      error: () => {
        this.stopLoading("delete", i);
        this.notifService.error("Impossible de supprimer le document");
      },
    });
  }

  private slugLabel(docName: string) {
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

  private startLoading(loadingType: "delete" | "download", loadingRef: number) {
    this.loadings[loadingType].push(loadingRef);
  }

  private stopLoading(loadingType: "delete" | "download", loadingRef: number) {
    setTimeout(() => {
      const index = this.loadings[loadingType].indexOf(loadingRef);
      if (index !== -1) {
        this.loadings[loadingType].splice(index, 1);
      }
    }, 500);
  }
}
