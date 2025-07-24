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
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { DocumentService } from "../../services/document.service";
import {
  NoWhiteSpaceValidator,
  UploadResponseType,
  validateUpload,
} from "../../../../shared";
import { UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
})
export class UploadComponent implements OnInit, OnDestroy {
  public submitted = false;
  public loading = false;

  public uploadResponse: UploadResponseType;
  public uploadForm!: UntypedFormGroup;

  @Output() public readonly getUsagerDocs = new EventEmitter<void>();
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input() public edit!: boolean;

  private readonly subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService
  ) {
    this.uploadResponse = { status: "", message: 0, filePath: "", body: [] };
  }

  public get u(): { [key: string]: AbstractControl } {
    return this.uploadForm.controls;
  }

  public ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      fileSource: ["", [Validators.required, validateUpload("USAGER_DOC")]],
      file: ["", [Validators.required]],
      label: [
        "",
        [
          Validators.required,
          NoWhiteSpaceValidator,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
    });
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

  public submitFile(): void {
    this.submitted = true;

    if (this.uploadForm.invalid) {
      this.toastService.error("Le formulaire d'upload comporte des erreurs");
      return;
    }

    this.loading = true;

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileSource.value);
    formData.append("label", this.uploadForm.controls.label.value);
    this.subscription.add(
      this.documentService.upload(formData, this.usager.ref).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (uploadResponse: any) => {
          this.uploadResponse = uploadResponse;
          if (
            this.uploadResponse.success !== undefined &&
            this.uploadResponse.success
          ) {
            this.loading = false;
            this.submitted = false;
            this.uploadForm.reset();
            this.getUsagerDocs.emit();
            this.toastService.success("Fichier uploadé avec succès");
          }
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'uploader le fichier");
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
