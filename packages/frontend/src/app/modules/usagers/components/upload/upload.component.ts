import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { UsersService } from "src/app/modules/users/services/users.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "../../interfaces/usager";
import { DocumentService } from "../../services/document.service";
import { UsagerService } from "../../services/usager.service";
import { validateUpload } from "../../../../shared/upload-validator";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-upload",
  styleUrls: ["./upload.component.css"],
  templateUrl: "./upload.component.html",
})
export class UploadComponent implements OnInit {
  /* Upload */
  public fileName = "";
  public uploadResponse: any;

  public submittedFile = false;
  public uploadForm!: FormGroup;

  public uploadError: {
    fileSize: boolean;
    fileType: boolean;
  };

  @Input() public usager!: Usager;

  constructor(
    private formBuilder: FormBuilder,
    private documentService: DocumentService,
    public authService: AuthService,
    private notifService: ToastrService
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "" };

    this.uploadError = {
      fileSize: true,
      fileType: true,
    };
  }

  public ngOnInit() {
    this.uploadResponse = { status: "", message: "", filePath: "" };

    this.uploadForm = this.formBuilder.group({
      imageInput: [this.fileName, Validators.required],
      label: ["", Validators.required],
    });

    this.uploadError = {
      fileSize: true,
      fileType: true,
    };
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public onFileChange(event: Event) {
    const fileValidate = validateUpload(event, "USAGER_DOC");

    this.uploadError = fileValidate.errors;
    if (!this.uploadError.fileSize || !this.uploadError.fileType) {
      this.notifService.error(
        "Le format ou la taille du fichier n'est pas prit en charge"
      );
      return false;
    }

    this.fileName = fileValidate.file.name;
    this.uploadForm.controls.imageInput.setValue(fileValidate.file);
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

    this.documentService.upload(formData, this.usager.id).subscribe(
      (res) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.usager.docs = new Usager(this.uploadResponse.body.usager).docs;
          this.uploadForm.reset();
          this.fileName = "";
        }
      },
      (err) => {
        this.notifService.error("Impossible d'uploader le fichier");
      }
    );
  }
}
