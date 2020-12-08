import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";

import { AppUser } from "../../../../../_common/model";
import { StructureDoc } from "../../../../../_common/model/structure-doc";

import { StructureDocService } from "../../services/structure-doc.service";

@Component({
  selector: "app-structures-upload-docs",
  styleUrls: ["./structures-upload-docs.component.css"],
  templateUrl: "./structures-upload-docs.component.html",
})
export class StructuresUploadDocsComponent implements OnInit {
  /* Upload */
  public fileName = "";
  public uploadResponse: any;

  public submittedFile = false;
  public uploadForm!: FormGroup;

  public structureDocs: StructureDoc[];

  public uploadError: {
    fileSize: boolean;
    fileType: boolean;
  };

  public httpError: any;

  public loadingDelete: boolean;
  public loadingDownload: boolean;

  @Input() public me: AppUser;

  // TODO: factoriser le service Upload
  constructor(
    private formBuilder: FormBuilder,
    private structureDocService: StructureDocService,
    private notifService: ToastrService
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "" };

    this.uploadError = {
      fileSize: true,
      fileType: true,
    };

    this.loadingDelete = false;
    this.loadingDownload = false;
    this.structureDocs = [];
  }

  public ngOnInit() {
    this.uploadResponse = { status: "", message: "", filePath: "" };

    this.uploadForm = this.formBuilder.group({
      imageInput: [this.fileName, Validators.required],
      label: ["", Validators.required],
      custom: [false],
    });

    this.uploadError = {
      fileSize: true,
      fileType: true,
    };

    this.getAllStructureDocs();
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public getAllStructureDocs(): void {
    this.structureDocService.getAllStructureDocs().subscribe(
      (structureDocs: StructureDoc[]) => {
        this.structureDocs = structureDocs;
      },
      (error: any) => {}
    );
  }

  public deleteStructureDoc(structureDoc: StructureDoc): void {
    this.structureDocService.deleteStructureDoc(structureDoc.id).subscribe(
      () => {
        this.notifService.success("Suppression réussie");
        this.getAllStructureDocs();
      },
      (error: any) => {
        this.notifService.error("Impossible de télécharger le fichier");
      }
    );
  }

  public getStructureDoc(structureDoc: StructureDoc): void {
    this.structureDocService.getStructureDoc(structureDoc.id).subscribe(
      (blob: any) => {
        const extensionTmp = structureDoc.path.split(".");
        const extension = extensionTmp[1];
        const newBlob = new Blob([blob], { type: structureDoc.filetype });

        saveAs(newBlob, "doc_" + "." + extension);

        this.loadingDownload = false;
      },
      (error: any) => {
        this.loadingDownload = false;
        this.notifService.error("Impossible de télécharger le fichier");
      }
    );
  }

  public onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const validFileExtensions = [
        "image/jpg",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.oasis.opendocument.text",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      const type = event.target.files[0].type;
      const size = event.target.files[0].size;

      this.fileName = event.target.files[0].name;
      this.uploadError = {
        fileSize: size < 10000000,
        fileType: validFileExtensions.includes(type),
      };

      this.uploadForm.controls.imageInput.setValue(file);
      if (!this.uploadError.fileSize || !this.uploadError.fileType) {
        return false;
      }
    }
  }

  public submitFile() {
    this.submittedFile = true;
    this.uploadError = {
      fileSize: true,
      fileType: true,
    };

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.imageInput.value);
    formData.append("label", this.uploadForm.controls.label.value);
    formData.append("custom", "false");

    this.structureDocService.upload(formData).subscribe(
      (res) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          console.log(res);
          this.uploadForm.reset();
          this.fileName = "";
          this.getAllStructureDocs();
        }
      },
      (err) => (this.httpError = err)
    );
  }
}
