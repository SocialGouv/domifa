import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";

import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";

import { Subscription } from "rxjs";
import { UserStructure, UsagersImportMode } from "../../../../../_common/model";
import { LoadingService } from "../../../shared/services";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { IMPORT_PREVIEW_COLUMNS } from "../../constants";
import { ImportUsagersService } from "../../import-usagers.service";
import { ImportPreviewTable, ImportPreviewRow } from "../../types";

@Component({
  selector: "app-import",
  styleUrls: ["./import.component.css"],
  templateUrl: "./import.component.html",
})
export class ImportComponent implements OnInit, OnDestroy {
  public uploadForm!: UntypedFormGroup;

  public showTable: boolean;

  public etapeImport: "preview-import" | "select-file";

  public me!: UserStructure | null;

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  public previewTable?: ImportPreviewTable;
  public visibleRows: ImportPreviewRow[];
  public readonly COL = IMPORT_PREVIEW_COLUMNS;

  private readonly subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly importUsagersService: ImportUsagersService,
    private readonly loadingService: LoadingService,
    private readonly router: Router,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.visibleRows = [];
    this.showTable = false;
    this.etapeImport = "select-file";
    this.showTable = false;
  }

  public get u(): Record<string, AbstractControl> {
    return this.uploadForm.controls;
  }

  public reset(): void {
    this.form.nativeElement.reset();
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Importer vos domiciliés sur DomiFa");

    this.uploadForm = this.formBuilder.group({
      fileInput: ["", Validators.required],
    });
  }

  public onFileChange(event: Event) {
    try {
      const input = event.target as HTMLInputElement;

      if (!input.files) {
        this.toastService.error("Seul les fichiers Excel sont autorisés");
        return;
      }

      if (
        !input.files.length ||
        (input.files[0].type !== "application/vnd.ms-excel" &&
          input.files[0].type !==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
          input.files[0].type !==
            "application/vnd.oasis.opendocument.spreadsheet")
      ) {
        this.toastService.error("Seul les fichiers Excel sont autorisés");
        return;
      }

      this.etapeImport = "preview-import";

      this.showTable = false;

      const file = input.files[0];
      this.uploadForm.controls.fileInput.setValue(file);

      this.submitFile("preview");
    } catch (err) {
      console.error("Error while uploading file", err);
      this.toastService.error("Erreur inattendue, veuillez réessayer.");
      this.backToEtapeSelectFile();
    }
  }

  public submitFile(submittedImportMode: UsagersImportMode) {
    this.loadingService.startLoading();

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileInput.value);

    this.subscription.add(
      this.importUsagersService
        .import(submittedImportMode, formData)
        .subscribe({
          error: (error: HttpErrorResponse) => {
            this.toastService.error("Le fichier n'a pas pu être importé ");
            this.loadingService.stopLoading();

            if (error.error?.previewTable) {
              this.showTable = true;
              this.previewTable = error.error.previewTable;
              this.visibleRows = error.error.previewTable.rows.slice(0, 50); // show 50 rows max
            } else {
              this.backToEtapeSelectFile();
            }
          },
          next: ({ importMode, previewTable }) => {
            this.loadingService.stopLoading();
            if (importMode === "preview") {
              this.showTable = true;
              this.previewTable = previewTable;
              this.visibleRows = this.previewTable.rows.slice(0, 50); // show 50 rows max
            } else {
              this.toastService.success("L'import a eu lieu avec succès");
              this.router.navigate(["/manage"]);
            }
          },
        })
    );
  }

  public backToEtapeSelectFile(): void {
    this.etapeImport = "select-file";
    this.showTable = false;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
