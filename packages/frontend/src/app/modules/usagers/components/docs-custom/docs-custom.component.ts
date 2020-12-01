import { Component, Input, OnInit } from "@angular/core";

import { AuthService } from "src/app/modules/shared/services/auth.service";

import { ToastrService } from "ngx-toastr";
import { MatomoTracker } from "ngx-matomo";
import { saveAs } from "file-saver";
import { DocumentService } from "../../services/document.service";
import { Usager } from "../../interfaces/usager";
@Component({
  selector: "app-docs-generated",
  styleUrls: ["./docs-custom.component.css"],
  templateUrl: "./docs-custom.component.html",
})
export class DocsCustomComponent implements OnInit {
  @Input() public usager!: Usager;

  public loadingDelete: boolean;
  public loadingDownload: boolean;

  constructor(
    private documentService: DocumentService,
    public authService: AuthService,
    private notifService: ToastrService,
    private matomo: MatomoTracker
  ) {
    this.loadingDelete = false;
    this.loadingDownload = false;
  }

  public ngOnInit() {}

  public getDocument(i: number) {
    this.loadingDownload = true;
    this.documentService
      .getGeneratedDoc(this.usager.id, "attestation")
      .subscribe(
        (blob: any) => {
          const doc = this.usager.docs[i];
          const extensionTmp = doc.filetype.split("/");
          const extension = extensionTmp[1];
          const newBlob = new Blob([blob], { type: doc.filetype });

          saveAs(newBlob, "attestation." + extension);

          this.matomo.trackEvent("stats", "telechargement_fichier", "null", 1);
          this.loadingDownload = false;
        },
        (error: any) => {
          this.loadingDownload = false;
          this.notifService.error("Impossible de télécharger le fichier");
        }
      );
  }
}
