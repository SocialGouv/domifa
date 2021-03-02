import { Component, Input, OnInit } from "@angular/core";

import { saveAs } from "file-saver";

import { StructureDocTypesAvailable } from "../../../../../../_common/model/structure-doc";
import { DocumentService } from "../../../services/document.service";
import { UsagerFormModel } from "../../form/UsagerFormModel";

@Component({
  selector: "app-profil-structure-docs",
  styleUrls: ["./profil-structure-docs.component.css"],
  templateUrl: "./profil-structure-docs.component.html",
})
export class ProfilStructureDocsComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;

  public loadingDelete: boolean;
  public loadingDownload: boolean;

  constructor(private documentService: DocumentService) {
    this.loadingDelete = false;
    this.loadingDownload = false;
  }

  public ngOnInit() {}

  // Documents définis par Domifa
  public getStructureDocument(docType: StructureDocTypesAvailable) {
    this.loadingDownload = true;
    this.documentService.getStructureDoc(this.usager.ref, docType).subscribe(
      (blob: any) => {
        const newBlob = new Blob([blob], {
          type:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveAs(newBlob, docType + ".docx");
        this.loadingDownload = false;
      },
      (error: any) => {
        this.loadingDownload = false;
      }
    );
  }

  // Documents uploadés par les strucutres
  public getCustomDocument(docId: string) {}
}
