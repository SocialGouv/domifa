import { Component, Input, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagerLight } from "../../../../../_common/model";
import {
  UploadResponseType,
  validateUpload,
} from "../../../../shared/upload-validator";
import { DocumentService } from "../../services/document.service";

@Component({
  selector: "app-upload",
  styleUrls: ["./upload.component.css"],
  templateUrl: "./upload.component.html",
})
export class UploadComponent implements OnInit {
  public submitted = false;
  public loading = false;

  public uploadResponse: UploadResponseType;
  public uploadForm!: FormGroup;

  @Input() public usager!: UsagerLight;

  constructor(
    private formBuilder: FormBuilder,
    private documentService: DocumentService,
    private toastService: CustomToastService
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "", body: [] };
  }

  get u(): { [key: string]: AbstractControl } {
    return this.uploadForm.controls;
  }

  public ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      fileSource: ["", [Validators.required, validateUpload("USAGER_DOC")]],
      file: ["", [Validators.required]],
      label: ["", Validators.required],
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

    this.documentService.upload(formData, this.usager.ref).subscribe({
      next: (uploadResponse: any) => {
        this.uploadResponse = uploadResponse;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.usager.docs = this.uploadResponse.body;

          this.loading = false;
          this.submitted = false;
          this.uploadForm.reset();
          this.toastService.success("Fichier uploadé avec succès");
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.error("Impossible d'uploader le fichier");
      },
    });
  }
}
