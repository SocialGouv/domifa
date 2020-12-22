import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { saveAs } from "file-saver";
import { ToastrService } from "ngx-toastr";
import { AppUser } from "../../../../../_common/model";
import { StructureDoc } from "../../../../../_common/model/structure-doc";
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

  public submitted = false;
  public uploadForm!: FormGroup;

  public structureDocs: StructureDoc[];

  @Input() public me: AppUser;

  constructor(
    private formBuilder: FormBuilder,
    private structureDocService: StructureDocService,
    private notifService: ToastrService
  ) {
    this.uploadResponse = { status: "", message: "", filePath: "" };
    this.structureDocs = [];
  }

  public ngOnInit() {
    console.log(this.me);
    this.uploadForm = this.formBuilder.group({
      fileSource: ["", [Validators.required, validateUpload("STRUCTURE_DOC")]],
      file: ["", [Validators.required]],
      label: ["", Validators.required],
    });

    this.getAllStructureDocs();
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public getAllStructureDocs(): void {
    this.structureDocService.getAllStructureDocs().subscribe(
      (structureDocs: StructureDoc[]) => {
        this.structureDocs = structureDocs;
      },
      (error: any) => {
        this.notifService.error("Impossible d'afficher les documents");
      }
    );
  }

  public deleteStructureDoc(structureDoc: StructureDoc): void {
    structureDoc.loadingDelete = true;
    this.structureDocService.deleteStructureDoc(structureDoc.id).subscribe(
      () => {
        structureDoc.loadingDelete = false;
        this.getAllStructureDocs();
        this.notifService.success("Suppression réussie");
      },
      (error: any) => {
        structureDoc.loadingDelete = false;
        this.notifService.error("Impossible de télécharger le fichier");
      }
    );
  }

  public getStructureDoc(structureDoc: StructureDoc): void {
    structureDoc.loadingDownload = true;
    this.structureDocService.getStructureDoc(structureDoc.id).subscribe(
      (blob: any) => {
        const extension = structureDoc.path.split(".")[1];
        const newBlob = new Blob([blob], { type: structureDoc.filetype });
        saveAs(newBlob, structureDoc.label + "." + extension);
        structureDoc.loadingDownload = false;
      },
      (error: any) => {
        this.notifService.error("Impossible de télécharger le fichier");
        structureDoc.loadingDownload = false;
      }
    );
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
    formData.append("custom", "false");

    this.structureDocService.upload(formData).subscribe(
      (res: any) => {
        this.uploadResponse = res;
        if (
          this.uploadResponse.success !== undefined &&
          this.uploadResponse.success
        ) {
          this.uploadForm.reset();
          this.fileName = "";
          this.getAllStructureDocs();
          this.notifService.success("Fichier uploadé avec succès");
          this.submitted = false;
        }
      },
      () => {
        this.submitted = false;
        this.notifService.error("Impossible d'uploader le fichier");
      }
    );
  }
}
