import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { ToastrService } from "ngx-toastr";
import { StructureDoc } from "../../../../../_common/model/structure-doc";
import {
  UploadResponseType,
  validateUpload,
} from "../../../../shared/upload-validator";
import { AuthService } from "../../../shared/services/auth.service";
import { StructureDocService } from "../../services/structure-doc.service";

@Component({
  selector: "app-structures-upload-docs",
  styleUrls: ["./structures-upload-docs.component.css"],
  templateUrl: "./structures-upload-docs.component.html",
})
export class StructuresUploadDocsComponent implements OnInit {
  public fileName = "";
  public uploadResponse: UploadResponseType;

  public loading = false;
  public submitted = false;
  public uploadForm!: FormGroup;

  @Input() public isCustomDoc: boolean;

  @Output()
  public cancel = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private structureDocService: StructureDocService,
    private notifService: ToastrService
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "" };
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public initForm(): void {
    this.uploadForm = this.formBuilder.group({
      fileSource: [
        "",
        [
          Validators.required,
          this.isCustomDoc
            ? validateUpload("STRUCTURE_DOC")
            : validateUpload("STRUCTURE_CUSTOM_DOC"),
        ],
      ],
      label: ["", Validators.required],
      customDocType: [null],
      isCustomDoc: [this.isCustomDoc ? "true" : "false"],
      file: [""],
    });
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public onFileChange(event: Event): void {
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
    console.log("45156156");
    console.log(this.uploadForm.errors);

    if (this.uploadForm.invalid) {
      this.notifService.error("Le formulaire d'upload comporte des erreurs");
      return;
    }

    this.loading = true;

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileSource.value);

    formData.append("label", this.uploadForm.controls.label.value);
    formData.append("custom", this.uploadForm.controls.isCustomDoc.value);
    formData.append(
      "customDocType",
      this.uploadForm.controls.customDocType.value
    );

    this.structureDocService.upload(formData).subscribe({
      next: (res: any) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.loading = false;
          this.submitted = false;
          this.uploadForm.reset();
          this.fileName = "";
          this.notifService.success("Fichier uploadé avec succès");
        }
      },
      error: () => {
        this.loading = false;
        this.submitted = false;
        this.notifService.error("Impossible d'uploader le fichier");
      },
    });
  }
}
