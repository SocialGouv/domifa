import { Component, Input, OnInit } from "@angular/core";

import { saveAs } from "file-saver";
import { DocumentService } from "../../services/document.service";
import { Usager } from "../../interfaces/usager";
import { StructureDocTypesAvailable } from "../../../../../_common/model/structure-doc/StructureDocTypesAvailable.type";
@Component({
  selector: "app-custom-docs",
  styleUrls: ["./docs-custom.component.css"],
  templateUrl: "./docs-custom.component.html",
})
export class DocsCustomComponent implements OnInit {
  @Input() public usager!: Usager;

  public loadingDelete: boolean;
  public loadingDownload: boolean;

  constructor(private documentService: DocumentService) {
    this.loadingDelete = false;
    this.loadingDownload = false;
  }

  public ngOnInit() {}

  // Documents définis par Domifa
  public getDocument(docType: StructureDocTypesAvailable) {
    this.loadingDownload = true;
    this.documentService.getStructureDoc(this.usager.id, docType).subscribe(
      (blob: any) => {
        const newBlob = new Blob([blob], {
          type:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveAs(newBlob, "attestation.docx");
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
