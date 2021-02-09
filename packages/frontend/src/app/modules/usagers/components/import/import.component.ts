import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import * as XLSX from "xlsx";
import { AppUser } from "../../../../../_common/model";
import { LoadingService } from "../../../loading/loading.service";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerService } from "../../services/usager.service";
import {
  ImportPreviewBuilder,
  ImportPreviewRow,
  ImportPreviewTable,
} from "./ImportPreviewBuilder.service";
import { IMPORT_PREVIEW_COLUMNS } from "./IMPORT_PREVIEW_COLUMNS.const";

export const colNames = [
  "Numéro d'identification",
  "Civilité",
  "Nom",
  "Prénom",
  "Nom d'usage / Surnom",
  "Date naissance",
  "Lieu naissance",
  "Téléphone",
  "Email",
  "Statut demande",
  "Motif de refus",
  "Motif de radiation",
  "Type de domiciliation",
  "Date de Début de la domiciliation",
  "Date de fin de la domiciliation",
  "Date 1ere domiciliation",
  "Date de dernier passage",
  "Orientation",
  "Détails de l'orientation",
  "La personne a t-elle déjà une domiciliation ?",
  "Le domicilié possède t-il des revenus ?",
  "Seulement si revenus, de quelle nature ?",
  "Lien avec la commune",
  "Composition du ménage",
  "Situation résidentielle",
  "Si autre situation résidentielle, précisez",
  "Cause instabilité logement",
  "Si autre cause, précisez",
  "Motif principal de la demande",
  "Si autre motif, précisez",
  "Accompagnement social",
  "Par quelle structure est fait l'accompagnement ?",
  "Commentaires",
];
type AOA = any[][];

@Component({
  providers: [UsagerService],
  selector: "app-import",
  styleUrls: ["./import.component.css"],
  templateUrl: "./import.component.html",
})
export class ImportComponent implements OnInit {
  public datas: AOA = [[], []];

  public uploadForm!: FormGroup;
  public fileName: string;
  public errorsList: any;

  public canUpload: boolean;
  public success: boolean;
  public uploadError: boolean;
  public showTable: boolean;
  public showErrors: boolean;

  public nbreAyantsDroits: number[];

  public colNames: string[];
  public etapeImport: number;

  public me: AppUser;

  public etapes = [
    "Téléchargement de votre fichier",
    "Vérification des données",
  ];

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

  public COMPOSITION_MENAGE = 23;
  public SITUATION_RESIDENTIELLE = 24;
  public SITUATION_DETAILS = 25;

  public CAUSE_INSTABILITE = 26;
  public CAUSE_DETAILS = 27;

  public RAISON_DEMANDE = 28;
  public RAISON_DEMANDE_DETAILS = 29;

  public ACCOMPAGNEMENT = 30;
  public ACCOMPAGNEMENT_DETAILS = 31;
  public COMMENTAIRES = 32;

  public AYANT_DROIT = [33, 37, 41, 45, 49, 53, 57, 61, 65];

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
    private titleService: Title,
    private importPreviewBuilder: ImportPreviewBuilder,
    private ngZone: NgZone
  ) {
    this.canUpload = false;
    this.colNames = colNames;
    this.etapeImport = 0;
    this.fileName = "";
    this.showErrors = false;
    this.showTable = false;
    this.success = false;
    this.uploadError = false;

    for (let cpt = 0; cpt < 10; cpt++) {
      this.colNames.push("Ayant-droit " + cpt + ": nom");
      this.colNames.push("Ayant-droit " + cpt + ": prénom");
      this.colNames.push("Ayant-droit " + cpt + ": date naissance");
      this.colNames.push("Ayant-droit " + cpt + ": lien parenté");
    }
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public reset() {
    this.form.nativeElement.reset();
  }

  public ngOnInit() {
    this.titleService.setTitle("Importer vos domiciliés sur Domifa");

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.uploadForm = this.formBuilder.group({
      fileInput: [this.fileName, Validators.required],
    });
  }

  public onFileChange(evt: any) {
    this.uploadError = false;

    const target: DataTransfer = evt.target as DataTransfer;
    const file = evt.target.files[0];

    if (
      target.files.length !== 1 ||
      (target.files[0].type !== "application/vnd.ms-excel" &&
        target.files[0].type !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        target.files[0].type !==
          "application/vnd.oasis.opendocument.spreadsheet")
    ) {
      this.uploadError = true;
      return;
    }

    this.showTable = true;
    this.etapeImport = 1;
    this.uploadForm.controls.fileInput.setValue(file);

    this.ngZone.runOutsideAngular(() => {
      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, {
          dateNF: "dd/mm/yyyy",
          type: "binary",
        });

        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        let datas = XLSX.utils.sheet_to_json(ws, {
          blankrows: false,
          dateNF: "dd/mm/yyyy",
          header: 1,
          raw: false,
        }) as AOA;

        datas = datas.slice(1);

        this.ngZone.run(() => {
          this.previewTable = this.importPreviewBuilder.buildPreviewTable(
            datas
          );
          this.visibleRows = this.previewTable.isValid
            ? this.previewTable.rows.slice(0, 50) // show only first 50 rows
            : this.previewTable.rows.filter((x) => !x.isValid).slice(0, 50); // show only first 50 error rows
        });
      };
      reader.readAsBinaryString(target.files[0]);
    });
  }

  public submitFile() {
    this.loadingService.startLoading();

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileInput.value);

    this.usagerService.import(formData).subscribe(
      (res: any) => {
        this.notifService.success("L'import a eu lieu avec succès");
        this.loadingService.stopLoading();
        this.router.navigate(["/manage"]);
      },
      (error: any) => {
        this.notifService.error("Le fichier n'a pas pu être importé ");
        this.loadingService.stopLoading();
      }
    );
  }

  public reload() {
    location.reload();
  }
}
