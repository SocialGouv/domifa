import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
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
  public fileName = "";
  public submitted = false;
  public uploadResponse: UploadResponseType;

  public uploadForm!: FormGroup;

  @Input() public usager!: UsagerLight;

  constructor(
    private formBuilder: FormBuilder,
    private documentService: DocumentService,
    private notifService: ToastrService
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "", body: [] };
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public ngOnInit() {
    this.uploadForm = this.formBuilder.group({
      fileSource: ["", [Validators.required, validateUpload("USAGER_DOC")]],
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

  private rebuildDocStates() {
    this.usager.docs = this.usager.docs.map((d) => ({
      ...d,
      loadingDownload: false,
      loadingDelete: false,
    }));
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

    this.documentService.upload(formData, this.usager.ref).subscribe(
      (res: any) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.usager.docs = this.uploadResponse.body;
          this.uploadForm.reset();
          this.fileName = "";
          this.submitted = false;
          this.notifService.success("Fichier uploadé avec succès");

          this.rebuildDocStates();
        }
      },
      (err) => {
        this.notifService.error("Impossible d'uploader le fichier");
      }
    );
  }
}
