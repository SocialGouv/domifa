import { STRUCTURE_DOC_EXTENSIONS_LABELS, UsagerDoc } from "src/_common/model";
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

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

  @ViewChildren("usagerDocsDeleteButtons")
  usagerDocsDeleteButtons: QueryList<ElementRef>;

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
        this.toastService.error("Impossible de télécharger le fichier");
      },
    });
  }

  public deleteDocument(docIndex: number): void {
    this.startLoading("delete", docIndex);

    this.documentService.deleteDocument(this.usager.ref, docIndex).subscribe({
      next: (docs: UsagerDoc[]) => {
        this.usager.docs = docs;

        this.stopLoading("delete", docIndex);
        this.toastService.success("Document supprimé avec succès");
      },
      error: () => {
        this.stopLoading("delete", docIndex);
        this.toastService.error("Impossible de supprimer le document");
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

  private focusDeleteDoc(index: number) {
    // Par défaut on va au dernier point du tablea
    let newIndexToFocus = this.usager.docs.length - 1;

    // S'il reste des éléments dans le tableaux, on focus sur le suivant
    if (index < newIndexToFocus) {
      newIndexToFocus = index;
    }

    // Focus sur l'élément créé
    setTimeout(() => {
      const elements = this.usagerDocsDeleteButtons.toArray();
      elements[newIndexToFocus].nativeElement.focus();
    }, 500);
  }

  private stopLoading(loadingType: "delete" | "download", loadingRef: number) {
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
