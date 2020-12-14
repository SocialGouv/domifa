import { Component, Input, OnInit } from "@angular/core";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "../../interfaces/usager";
import { DocumentService } from "../../services/document.service";

import { ToastrService } from "ngx-toastr";
import { MatomoTracker } from "ngx-matomo";
import { saveAs } from "file-saver";
@Component({
  selector: "app-documents",
  styleUrls: ["./documents.component.css"],
  templateUrl: "./documents.component.html",
})
export class DocumentsComponent implements OnInit {
  @Input() public usager!: Usager;

  constructor(
    private documentService: DocumentService,
    public authService: AuthService,
    private notifService: ToastrService,

    private matomo: MatomoTracker
  ) {}

  public ngOnInit() {}

  public getDocument(i: number) {
    this.usager.docs[i].loading = true;
    this.documentService
      .getDocument(this.usager.id, i, this.usager.docs[i])
      .subscribe(
        (blob: any) => {
          const doc = this.usager.docs[i];
          const extensionTmp = doc.filetype.split("/");
          const extension = extensionTmp[1];
          const newBlob = new Blob([blob], { type: doc.filetype });

          saveAs(
            newBlob,
            this.setDocName(doc.label) +
              "_" +
              this.setDocName(this.usager.nom + " " + this.usager.prenom) +
              "." +
              extension
          );

          this.matomo.trackEvent("stats", "telechargement_fichier", "null", 1);
          this.usager.docs[i].loading = false;
        },
        (error: any) => {
          this.usager.docs[i].loading = false;
          this.notifService.error("Impossible de télécharger le fichier");
        }
      );
  }

  public deleteDocument(i: number): void {
    this.usager.docs[i].loading = true;
    this.documentService.deleteDocument(this.usager.id, i).subscribe(
      (usager: Usager) => {
        this.usager.docs = usager.docs;
        this.usager.docs[i].loading = false;
        this.notifService.success("Document supprimé avec succès");
      },
      (error: any) => {
        this.usager.docs[i].loading = false;
        this.notifService.error("Impossible de supprimer le document");
      }
    );
  }

  private setDocName(docName: string) {
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
