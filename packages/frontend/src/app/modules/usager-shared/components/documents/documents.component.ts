import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { UsagerDoc } from "../../../../../_common/model";
import { UsagerLight } from "../../../../../_common/model/usager/UsagerLight.type";
import { DocumentService } from "../../services/document.service";

@Component({
  selector: "app-documents",
  styleUrls: ["./documents.component.css"],
  templateUrl: "./documents.component.html",
})
export class DocumentsComponent implements OnInit, OnChanges {
  @Input() public usager: UsagerLight;

  constructor(
    private documentService: DocumentService,
    private notifService: ToastrService,
    private matomo: MatomoTracker
  ) {}

  public ngOnChanges() {
    this.rebuildDocStates();
  }

  private rebuildDocStates() {
    this.usager.docs = this.usager.docs.map((d) => ({
      ...d,
      loadingDownload: false,
      loadingDelete: false,
    }));
  }

  public ngOnInit() {}

  public getDocument(i: number) {
    this.usager.docs[i].loadingDownload = true;
    this.documentService.getDocument(this.usager.ref, i).subscribe(
      (blob: any) => {
        const doc = this.usager.docs[i];
        const extension = doc.filetype.split("/")[1];
        const newBlob = new Blob([blob], { type: doc.filetype });

        saveAs(
          newBlob,
          this.slugLabel(doc.label) +
            "_" +
            this.slugLabel(this.usager.nom + " " + this.usager.prenom) +
            "." +
            extension
        );

        this.matomo.trackEvent("stats", "telechargement_fichier", "null", 1);
        this.usager.docs[i].loadingDownload = false;
      },
      () => {
        this.usager.docs[i].loadingDownload = false;
        this.notifService.error("Impossible de télécharger le fichier");
      }
    );
  }

  public deleteDocument(i: number): void {
    this.usager.docs[i].loadingDelete = true;
    this.documentService.deleteDocument(this.usager.ref, i).subscribe(
      (docs: UsagerDoc[]) => {
        this.usager.docs = docs;

        this.rebuildDocStates();
        this.notifService.success("Document supprimé avec succès");
      },
      () => {
        this.usager.docs[i].loadingDelete = false;
        this.notifService.error("Impossible de supprimer le document");
      }
    );
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
}
