import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";

import { AppUser } from "../../../../../_common/model";
import { StructureDoc } from "../../../../../_common/model/structure-doc";
import { validateUpload } from "../../../../shared/upload-validator";

import { StructureDocService } from "../../services/structure-doc.service";

@Component({
  selector: "app-structures-upload-docs",
  styleUrls: ["./structures-upload-docs.component.css"],
  templateUrl: "./structures-upload-docs.component.html",
})
export class StructuresUploadDocsComponent implements OnInit {
  public fileName = "";
  public uploadResponse: any;

  public submittedFile = false;
  public uploadForm!: FormGroup;

  public structureDocs: StructureDoc[];

  public uploadError: {
    fileSize: boolean;
    fileType: boolean;
  };

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
      docInput: [this.fileName, Validators.required],
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
        saveAs(newBlob, structureDoc.label + "." + extension);
        this.loadingDownload = false;
      },
      (error: any) => {
        this.loadingDownload = false;
        this.notifService.error("Impossible de télécharger le fichier");
      }
    );
  }

  public onFileChange(event: Event) {
    const fileValidate = validateUpload(event, "STRUCTURE_DOC");

    this.uploadError = fileValidate.errors;
    if (!this.uploadError.fileSize || !this.uploadError.fileType) {
      this.notifService.error(
        "Le format ou la taille du fichier n'est pas prit en charge"
      );
      return false;
    }

    this.fileName = fileValidate.file.name;
    this.uploadForm.controls.docInput.setValue(fileValidate.file);
  }

  public submitFile() {
    this.submittedFile = true;
    this.uploadError = {
      fileSize: true,
      fileType: true,
    };

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.docInput.value);
    formData.append("label", this.uploadForm.controls.label.value);
    formData.append("custom", "false");

    this.structureDocService.upload(formData).subscribe(
      (res) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.uploadForm.reset();
          this.fileName = "";
          this.getAllStructureDocs();
        }
      },
      (err) => {
        this.notifService.error("Impossible d'uploader le fichier");
      }
    );
  }
}
