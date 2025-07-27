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
import { LoadingService } from "../../../shared/services";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { ImportUsagersService } from "../../import-usagers.service";

import {
  USAGERS_IMPORT_COLUMNS,
  USAGERS_IMPORT_COLUMNS_AYANT_DROIT,
  ImportPreviewTable,
  ImportPreviewRow,
  UserStructure,
  UsagersImportMode,
} from "@domifa/common";
import { Store } from "@ngrx/store";
import { usagerActions, UsagerState } from "../../../../shared";
import {
  GeneralService,
  TYPE_CONSULTATION_DOCUMENT,
} from "../../../general/services/general.service";

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

  public readonly TYPE_CONSULTATION_DOCUMENT = TYPE_CONSULTATION_DOCUMENT;

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  public previewTable?: ImportPreviewTable;
  public visibleRows: ImportPreviewRow[];
  public readonly UsagersImportMode = UsagersImportMode;
  public readonly COL = USAGERS_IMPORT_COLUMNS;
  public readonly USAGERS_IMPORT_COLUMNS_AYANT_DROIT =
    USAGERS_IMPORT_COLUMNS_AYANT_DROIT;

  private readonly subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly importUsagersService: ImportUsagersService,
    private readonly loadingService: LoadingService,
    private readonly router: Router,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title,
    private readonly generalService: GeneralService,
    private readonly store: Store<UsagerState>
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
    this.titleService.setTitle("Importer des domiciliés sur DomiFa");

    this.uploadForm = this.formBuilder.group({
      fileInput: ["", Validators.required],
    });
  }

  public doLogDownloadAction(
    typeConsultation: TYPE_CONSULTATION_DOCUMENT
  ): Promise<void> {
    return this.generalService.logDownloadAction(typeConsultation);
  }

  public onFileChange(event: Event) {
    try {
      const input = event.target as HTMLInputElement;

      if (!input.files) {
        this.toastService.error("Seuls les fichiers Excel sont autorisés");
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
        this.toastService.error("Seuls les fichiers Excel sont autorisés");
        return;
      }

      this.etapeImport = "preview-import";
      this.showTable = false;

      const file = input.files[0];
      this.uploadForm.controls.fileInput.setValue(file);

      this.submitFile(UsagersImportMode.preview);
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
              this.store.dispatch(usagerActions.clearCache());
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
