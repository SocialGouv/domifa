import { Component, Input, OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight } from "../../../../../_common/model";
import { DocumentService } from "../../services/document.service";

@Component({
  selector: "app-docs-generated",
  styleUrls: ["./docs-custom.component.css"],
  templateUrl: "./docs-custom.component.html",
})
export class DocsCustomComponent implements OnInit {
  @Input() public usager!: UsagerLight;

  public loadingDelete: boolean;
  public loadingDownload: boolean;

  constructor(
    private documentService: DocumentService,
    public authService: AuthService
  ) {
    this.loadingDelete = false;
    this.loadingDownload = false;
  }

  public ngOnInit() {}

  public getDocument() {
    this.loadingDownload = true;
    this.documentService.getCustomDoc(this.usager.ref).subscribe(
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
}
