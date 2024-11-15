import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { StructureDocService } from "../../services/structure-doc.service";
import { NoWhiteSpaceValidator, validateUpload } from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { STRUCTURE_CUSTOM_DOC_LABELS } from "@domifa/common";

@Component({
  selector: "app-structures-upload-docs",
  templateUrl: "./structures-upload-docs.component.html",
})
export class StructuresUploadDocsComponent implements OnInit, OnDestroy {
  public loading = false;
  public submitted = false;
  public uploadForm!: UntypedFormGroup;

  @Input() public isCustomDoc!: boolean;
  private subscription = new Subscription();

  @Output()
  public readonly cancel = new EventEmitter<void>();

  @Output()
  public readonly getAllStructureDocs = new EventEmitter<void>();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly structureDocService: StructureDocService,
    private readonly toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      label: [
        "",
        [
          Validators.required,
          NoWhiteSpaceValidator,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],
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

    this.subscription.add(
      this.uploadForm.get("customDocType")?.valueChanges.subscribe((value) => {
        this.uploadForm
          .get("label")
          ?.setValue(
            value === "autre" ? "" : STRUCTURE_CUSTOM_DOC_LABELS[value]
          );
        this.uploadForm.get("label")?.updateValueAndValidity();
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.uploadForm.controls;
  }

  public async onFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    this.uploadForm.patchValue({
      fileSource: file,
    });
  }

  public submitFile(): void {
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
    this.subscription.add(
      this.structureDocService.upload(formData).subscribe({
        next: () => {
          this.toastService.success("Fichier uploadé avec succès");
          setTimeout(() => {
            this.loading = false;
            this.submitted = false;
            this.uploadForm.reset();
            this.cancel.emit();
            this.getAllStructureDocs.emit();
          }, 500);
        },
        error: () => {
          this.toastService.error("Impossible d'uploader le fichier");
          this.loading = false;
          this.submitted = false;
        },
      })
    );
  }
}
