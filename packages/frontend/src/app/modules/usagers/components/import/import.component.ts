import { Subscription } from "rxjs";
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
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagersImportMode, UserStructure } from "../../../../../_common/model";
import { LoadingService } from "../../../shared/services/loading.service";

import { UsagerService } from "../../services/usager.service";
import { IMPORT_PREVIEW_COLUMNS } from "./IMPORT_PREVIEW_COLUMNS.const";
import { ImportPreviewRow, ImportPreviewTable } from "./preview";

@Component({
  selector: "app-import",
  styleUrls: ["./import.component.css"],
  templateUrl: "./import.component.html",
})
export class ImportComponent implements OnInit, OnDestroy {
  public uploadForm!: FormGroup;

  public showTable: boolean;
  public etapeImport: "select-file" | "preview-import";

  public me!: UserStructure | null;

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  public previewTable?: ImportPreviewTable;
  public visibleRows: ImportPreviewRow[];

  public COL = IMPORT_PREVIEW_COLUMNS;

  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly usagerService: UsagerService,
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

  get u(): { [key: string]: AbstractControl } {
    return this.uploadForm.controls;
  }

  public reset() {
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

      if (
        !input.files?.length ||
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
      this.usagerService.import(submittedImportMode, formData).subscribe({
        next: ({ importMode, previewTable }) => {
          this.loadingService.stopLoading();
          if (importMode === "preview") {
            this.showTable = true;
            this.previewTable = previewTable;
            this.visibleRows = this.previewTable.rows.slice(0, 50); // show 50 rows max
          } else {
            // confirm
            this.toastService.success("L'import a eu lieu avec succès");
            this.router.navigate(["/manage"]);
          }
        },
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
      })
    );
  }

  public backToEtapeSelectFile(): void {
    this.etapeImport = "select-file";
    this.showTable = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}