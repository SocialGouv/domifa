import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { validateUpload } from "../../../../shared/upload-validator";
import { StructureDocService } from "../../services/structure-doc.service";

@Component({
  selector: "app-structures-upload-docs",
  styleUrls: ["./structures-upload-docs.component.css"],
  templateUrl: "./structures-upload-docs.component.html",
})
export class StructuresUploadDocsComponent implements OnInit {
  public loading = false;
  public submitted = false;
  public uploadForm!: FormGroup;

  @Input() public isCustomDoc!: boolean;

  @Output()
  public cancel = new EventEmitter<void>();

  @Output()
  public getAllStructureDocs = new EventEmitter<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly structureDocService: StructureDocService,
    private readonly toastService: CustomToastService
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

    this.uploadForm.get("customDocType")?.valueChanges.subscribe((value) => {
      this.uploadForm.get("label")?.setValue(value === "autre" ? "" : value);
      this.uploadForm.get("label")?.updateValueAndValidity();
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.uploadForm.controls;
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.uploadForm.patchValue({
      fileSource: file,
    });
  }

  public submitFile() {
    this.submitted = true;

    if (this.uploadForm.invalid) {
      this.toastService.error("Le formulaire d'upload comporte des erreurs");
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (uploadResponse: any) => {
        if (uploadResponse.success !== undefined && uploadResponse.success) {
          this.toastService.success("Fichier uploadé avec succès");
          setTimeout(() => {
            this.loading = false;
            this.submitted = false;
            this.uploadForm.reset();

            this.cancel.emit();
            this.getAllStructureDocs.emit();
          }, 1000);
        }
      },
      error: () => {
        this.toastService.error("Impossible d'uploader le fichier");
        this.loading = false;
        this.submitted = false;
      },
    });
  }
}
