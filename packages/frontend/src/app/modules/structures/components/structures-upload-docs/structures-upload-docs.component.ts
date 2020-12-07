import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Router } from "@angular/router";
import { AuthService } from "../../../shared/services/auth.service";

import { StructureUploadDocsService } from "../../services/structures-upload-docs.service";

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

  public uploadError: {
    fileSize: boolean;
    fileType: boolean;
  };

  public httpError: any;

  constructor(
    private formBuilder: FormBuilder,
    private structureUploadDocsService: StructureUploadDocsService,
    public authService: AuthService,
    private router: Router
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

  public onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const validFileExtensions = [
        "image/jpg",
        "application/pdf",
        "image/jpeg",
        "image/bmp",
        "image/gif",
        "image/png",
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
  }
}
