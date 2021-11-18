import { HttpErrorResponse } from "@angular/common/http";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { UserStructure } from "../../../../../_common/model";
import { LoadingService } from "../../../shared/services/loading.service";
import { AuthService } from "../../../shared/services/auth.service";
import {
  UsagerService,
  UsagersImportMode,
} from "../../services/usager.service";
import { IMPORT_PREVIEW_COLUMNS } from "./IMPORT_PREVIEW_COLUMNS.const";
import { ImportPreviewRow, ImportPreviewTable } from "./preview";

type AOA = any[][];

@Component({
  selector: "app-import",
  styleUrls: ["./import.component.css"],
  templateUrl: "./import.component.html",
})
export class ImportComponent implements OnInit {
  public datas: AOA = [[], []];

  public columnsHeaders: string[];

  public uploadForm!: FormGroup;

  public uploadError: boolean;

  public showTable: boolean;
  public showErrors: boolean;

  public errorsId: any[];
  public errorsRow: any[];

  public nbreAyantsDroits: number[];

  public etapeImport: "select-file" | "preview-import";

  public me: UserStructure;

  public CUSTOM_ID = 0;
  public CIVILITE = 1;
  public NOM = 2;
  public PRENOM = 3;
  public SURNOM = 4;
  public DATE_NAISSANCE = 5;
  public LIEU_NAISSANCE = 6;
  public PHONE = 7;
  public EMAIL = 8;
  public STATUT_DOM = 9;
  public MOTIF_REFUS = 10;
  public MOTIF_RADIATION = 11;
  public TYPE_DOM = 12;
  public DATE_DEBUT_DOM = 13;
  public DATE_FIN_DOM = 14;
  public DATE_PREMIERE_DOM = 15;
  public DATE_DERNIER_PASSAGE = 16;

  public ORIENTATION = 17;
  public ORIENTATION_DETAILS = 18;
  public DOMICILIATION_EXISTANTE = 19;
  public REVENUS = 20;
  public REVENUS_DETAILS = 21;
  public LIEN_COMMUNE = 22;
  public LIEN_COMMUNE_DETAILS: 23;

  public COMPOSITION_MENAGE: 24;
  public SITUATION_RESIDENTIELLE: 25;
  public SITUATION_DETAILS: 26;
  public CAUSE_INSTABILITE: 27;
  public CAUSE_DETAILS: 28;
  public RAISON_DEMANDE: 29;
  public RAISON_DEMANDE_DETAILS: 30;
  public ACCOMPAGNEMENT: 31;
  public ACCOMPAGNEMENT_DETAILS: 32;
  public COMMENTAIRES: 33;

  public AYANT_DROIT: [34, 38, 42, 46, 50, 54, 58, 62, 66];

  @ViewChild("form", { static: true })
  public form!: ElementRef<any>;
  previewTable: ImportPreviewTable;
  visibleRows: ImportPreviewRow[];

  public COL = IMPORT_PREVIEW_COLUMNS;

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    // Tableaux des erreurs
    this.errorsId = [];

    this.errorsRow = [];
    this.showErrors = false;
    this.showTable = false;

    this.etapeImport = "select-file";
    this.showErrors = false;
    this.showTable = false;
    this.uploadError = false;
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public reset() {
    this.form.nativeElement.reset();
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Importer vos domiciliés sur Domifa");

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

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
        this.uploadError = true;
        this.notifService.error("Seul les fichiers Excel sont autorisés");
        return;
      }

      this.etapeImport = "preview-import";
      this.datas = [[], []];
      this.showTable = false;

      const file = input.files[0];
      this.uploadForm.controls.fileInput.setValue(file);

      this.submitFile("preview");
    } catch (err) {
      console.error("Error while uploading file", err);
      this.uploadError = true;
      this.notifService.error("Erreur innatendue, veuillez réessayer.");
      this.backToEtapeSelectFile();
    }
  }

  public submitFile(importMode: UsagersImportMode) {
    this.loadingService.startLoading();

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileInput.value);

    this.usagerService.import(importMode, formData).subscribe(
      ({ importMode, previewTable }) => {
        this.loadingService.stopLoading();
        if (importMode === "preview") {
          this.showTable = true;
          this.previewTable = previewTable;
          this.visibleRows = this.previewTable.rows.slice(0, 50); // show 50 rows max
        } else {
          // confirm
          this.notifService.success("L'import a eu lieu avec succès");
          this.router.navigate(["/manage"]);
        }
      },
      (error: HttpErrorResponse) => {
        this.notifService.error("Le fichier n'a pas pu être importé ");
        this.loadingService.stopLoading();

        if (error.error?.previewTable) {
          this.showTable = true;
          this.previewTable = error.error.previewTable;
          this.visibleRows = this.previewTable.rows.slice(0, 50); // show 50 rows max
        } else {
          this.backToEtapeSelectFile();
        }
      }
    );
  }
  backToEtapeSelectFile() {
    this.etapeImport = "select-file";
    this.datas = [[], []];
    this.showTable = false;
  }
}
