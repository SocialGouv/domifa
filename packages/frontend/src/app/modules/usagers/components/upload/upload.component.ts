import { Component, HostListener, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "../../interfaces/usager";
import { DocumentService } from "../../services/document.service";

import {
  UploadResponseType,
  validateUpload,
} from "../../../../shared/upload-validator";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-upload",
  styleUrls: ["./upload.component.css"],
  templateUrl: "./upload.component.html",
})
export class UploadComponent implements OnInit {
  public fileName = "";
  public submitted = false;
  public uploadResponse: UploadResponseType;

  public uploadForm!: FormGroup;
  @Input() public usager!: Usager;

  constructor(
    private formBuilder: FormBuilder,
    private documentService: DocumentService,
    public authService: AuthService,
    private notifService: ToastrService
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "" };
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public ngOnInit() {
    this.uploadForm = this.formBuilder.group({
      fileSource: ["", [Validators.required, validateUpload("STRUCTURE_DOC")]],
      file: ["", [Validators.required]],
      label: ["", Validators.required],
    });
  }

  public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.fileName = file.name;
    this.uploadForm.patchValue({
      fileSource: file,
    });
  }

  public submitFile() {
    this.submitted = true;

    if (this.uploadForm.invalid) {
      this.notifService.error("Le formulaire d'upload comporte des erreurs");
      return;
    }

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileSource.value);
    formData.append("label", this.uploadForm.controls.label.value);

    this.documentService.upload(formData, this.usager.id).subscribe(
      (res: any) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.usager.docs = new Usager(this.uploadResponse.body.usager).docs;
          this.uploadForm.reset();
          this.fileName = "";
          this.submitted = false;
        }
      },
      (err) => {
        this.notifService.error("Impossible d'uploader le fichier");
      }
    );
  }
}
