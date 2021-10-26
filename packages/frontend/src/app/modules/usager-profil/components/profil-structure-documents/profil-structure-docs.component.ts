import { Component, Input, OnInit } from "@angular/core";

import { saveAs } from "file-saver";
import { StructureDocTypesAvailable } from "../../../../../_common/model/structure-doc";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { DocumentService } from "../../../usager-shared/services/document.service";

@Component({
  selector: "app-profil-structure-docs",
  styleUrls: ["./profil-structure-docs.component.css"],
  templateUrl: "./profil-structure-docs.component.html",
})
export class ProfilStructureDocsComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;

  public loadingDelete: string;
  public loadingDownload: string;
  string;
  constructor(private documentService: DocumentService) {
    this.loadingDelete = null;
    this.loadingDownload = null;
  }

  public ngOnInit(): void {}

  // Documents définis par Domifa
  public getStructureDocument(docType: StructureDocTypesAvailable): void {
    this.loadingDownload = docType;
    this.documentService.getStructureDoc(this.usager.ref, docType).subscribe(
      (blob: any) => {
        const newBlob = new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveAs(newBlob, docType + ".docx");
        this.loadingDownload = null;
      },
      () => {
        this.loadingDownload = null;
      }
    );
  }
}
