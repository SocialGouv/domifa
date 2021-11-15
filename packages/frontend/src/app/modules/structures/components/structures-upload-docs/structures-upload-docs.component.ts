import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { ToastrService } from "ngx-toastr";
import {
  UploadResponseType,
  validateUpload,
} from "../../../../shared/upload-validator";
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

  @Output()
  public getAllStructureDocs = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private structureDocService: StructureDocService,
    private notifService: ToastrService
  ) {}

  public ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      label: ["", [Validators.required]],
      file: ["", [Validators.required]],
      fileSource: [
        "",
        [
          Validators.required,
          this.isCustomDoc
            ? validateUpload("STRUCTURE_CUSTOM_DOC")
            : validateUpload("STRUCTURE_DOC"),
        ],
      ],
      customDocType: [null, this.isCustomDoc ? [Validators.required] : []],
      isCustomDoc: [this.isCustomDoc ? "true" : "false", []],
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

    if (this.uploadForm.invalid) {
      this.notifService.error("Le formulaire d'upload comporte des erreurs");
      return;
    }

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileSource.value);
    formData.append("label", this.uploadForm.controls.label.value);
    formData.append("custom", this.uploadForm.controls.isCustomDoc.value);

    if (this.isCustomDoc) {
      formData.append(
        "customDocType",
        this.uploadForm.controls.customDocType.value
      );
    }

    this.loading = true;

    this.structureDocService.upload(formData).subscribe({
      next: (uploadResponse: any) => {
        if (uploadResponse.success !== undefined && uploadResponse.success) {
          this.loading = false;
          this.submitted = false;
          this.uploadForm.reset();
          this.fileName = "";
          this.notifService.success("Fichier uploadé avec succès");
          this.cancel.emit();
          this.getAllStructureDocs.emit();
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
