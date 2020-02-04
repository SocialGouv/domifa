import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoadingService } from "src/app/modules/loading/loading.service";
import { AuthService } from "src/app/services/auth.service";
import * as XLSX from "xlsx";
import { regexp } from "../../../../shared/validators";
import { UsagerService } from "../../services/usager.service";

export const CIVILITE = 0;
export const NOM = 1;
export const PRENOM = 2;
export const SURNOM = 3;
export const DATE_NAISSANCE = 4;
export const LIEU_NAISSANCE = 5;
export const EMAIL = 6;
export const PHONE = 7;
export const STATUT_DOM = 8;
export const TYPE_DOM = 9;
export const DATE_DEBUT_DOM = 10;
export const DATE_FIN_DOM = 11;
export const DATE_PREMIERE_DOM = 12;
export const MOTIF_REFUS = 13;
export const MOTIF_RADIATION = 14;
export const COMPOSITION_MENAGE = 15;
export const AYANT_DROIT = [16, 20, 24, 28];
export const CUSTOM_ID = 32;

export const colNames = [
  "Civilité",
  "Nom",
  "Prénom",
  "Surnom",
  "Date naissance",
  "Lieu naissance",
  "Email",
  "Téléphone",
  "Statut demande",
  "Type demande",
  "Date de Début de la DOM actuelle",
  "Date de FIN de la DOM actuelle",
  "Date 1ere domiciliation",
  "Motif de refus",
  "Motif de radiation",
  "Composition du ménage",
  "Ayant-droit 1: nom",
  "Ayant-droit 1: prénom",
  "Ayant-droit 1: date naissance",
  "Ayant-droit 1: lien parenté",
  "Ayant-droit 2: nom",
  "Ayant-droit 2: prénom",
  "Ayant-droit 2: date naissance",
  "Ayant-droit 2: lien parenté",
  "Ayant-droit 3: nom",
  "Ayant-droit 3: prénom",
  "Ayant-droit 3: date naissance",
  "Ayant-droit 3: lien parenté",
  "Ayant-droit 4: nom",
  "Ayant-droit 4: prénom",
  "Ayant-droit 4: date de naissance",
  "Ayant-droit 4: lien parenté",
  "Numéro d'identification"
];

type AOA = any[][];

@Component({
  providers: [UsagerService],
  selector: "app-import",
  styleUrls: ["./import.component.css"],
  templateUrl: "./import.component.html"
})
export class ImportComponent implements OnInit {
  public datas: AOA = [[], []];

  public title: string;

  public uploadForm!: FormGroup;
  public fileName: string;
  public errorsList: any;

  public canUpload: boolean;
  public success: boolean;
  public uploadError: boolean;
  public showTable: boolean;
  public showErrors: boolean;
  public nbreAyantsDroits: any[];

  public errorsId: any[];
  public errorsColumn = new Array(32);

  public errorsRow: any[];

  public rowNumber: number;
  public colNames: string[];
  public etapeImport: number;

  public etapes = [
    "Enregistrement de la structure",
    "Création du compte personnel"
  ];

  @ViewChild("form", { static: true })
  public form!: ElementRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    public http: HttpClient
  ) {
    this.canUpload = false;
    this.colNames = colNames;
    this.errorsId = [];
    this.errorsList = {};
    this.errorsRow = [];
    this.etapeImport = 0;
    this.fileName = "";
    this.nbreAyantsDroits = [16, 20, 24, 28];
    this.rowNumber = 0;
    this.showErrors = false;
    this.showTable = false;
    this.success = false;
    this.title = "Importer vos domiciliés sur Domifa";
    this.uploadError = false;
  }

  get u(): any {
    return this.uploadForm.controls;
  }

  public reset() {
    this.form.nativeElement.reset();
  }

  public ngOnInit() {
    for (let index = 0; index < 32; index++) {
      this.errorsColumn[index] = 10;
    }

    this.uploadForm = this.formBuilder.group({
      fileInput: [this.fileName, Validators.required]
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
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
      this.uploadError = true;
      return;
    }

    this.showTable = true;
    this.datas = [[], []];
    this.etapeImport = 1;
    this.uploadForm.controls.fileInput.setValue(file);

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {
        dateNF: "dd/mm/yyyy",
        type: "binary"
      });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.datas = XLSX.utils.sheet_to_json(ws, {
        blankrows: false,
        dateNF: "dd/mm/yyyy",
        header: 1,
        raw: false
      }) as AOA;

      this.datas = this.datas.slice(1);
      this.datas.forEach((row, index: any) => {
        this.rowNumber = index;
        const sexeCheck = row[0] === "H" || row[0] === "F";

        this.countErrors(sexeCheck, index, CIVILITE);
        this.countErrors(this.notEmpty(row[NOM]), index, NOM);
        this.countErrors(this.notEmpty(row[PRENOM]), index, PRENOM);
        this.countErrors(
          this.validDate(row[DATE_NAISSANCE], true),
          index,
          DATE_NAISSANCE
        );
        this.countErrors(
          this.notEmpty(row[LIEU_NAISSANCE]),
          index,
          LIEU_NAISSANCE
        );
        this.countErrors(this.validEmail(row[EMAIL]), index, EMAIL);
        this.countErrors(this.validPhone(row[PHONE]), index, PHONE);
        this.countErrors(
          this.isValidValue(row[STATUT_DOM], "statut", true),
          index,
          STATUT_DOM
        );
        this.countErrors(
          this.isValidValue(row[TYPE_DOM], "demande", true),
          index,
          TYPE_DOM
        );

        this.countErrors(
          this.validDate(row[DATE_DEBUT_DOM], true),
          index,
          DATE_DEBUT_DOM
        );
        this.countErrors(
          this.validDate(row[DATE_FIN_DOM], true),
          index,
          DATE_FIN_DOM
        );
        this.countErrors(
          this.validDate(row[DATE_PREMIERE_DOM], false),
          index,
          DATE_PREMIERE_DOM
        );
        this.countErrors(
          this.isValidValue(row[MOTIF_REFUS], "motifRefus"),
          index,
          MOTIF_REFUS
        );
        this.countErrors(
          this.isValidValue(row[MOTIF_RADIATION], "motifRadiation"),
          index,
          MOTIF_RADIATION
        );
        this.countErrors(
          this.isValidValue(row[COMPOSITION_MENAGE], "menage"),
          index,
          COMPOSITION_MENAGE
        );

        for (const indexAD of AYANT_DROIT) {
          const nom = row[indexAD];
          const prenom = row[indexAD + 1];
          const dateNaissance = row[indexAD + 2];
          const lienParente = row[indexAD + 3];

          if (
            typeof nom !== "undefined" ||
            typeof prenom !== "undefined" ||
            typeof dateNaissance !== "undefined" ||
            typeof lienParente !== "undefined"
          ) {
            this.countErrors(this.notEmpty(nom), this.rowNumber, indexAD);
            this.countErrors(
              this.notEmpty(prenom),
              this.rowNumber,
              indexAD + 1
            );

            this.countErrors(
              this.validDate(dateNaissance, true),
              this.rowNumber,
              indexAD + 2
            );

            this.countErrors(
              this.isValidValue(lienParente, "lienParente", true),
              this.rowNumber,
              indexAD + 3
            );
          }
        }
      });
    };
    reader.readAsBinaryString(target.files[0]);
  }

  public submitFile() {
    this.loadingService.startLoading();

    const formData = new FormData();
    formData.append("file", this.uploadForm.controls.fileInput.value);

    this.usagerService.import(formData).subscribe(
      res => {
        setTimeout(() => {
          this.loadingService.stopLoading();
          this.router.navigate(["/manage"]);
        }, 1000);
      },
      err => {
        this.loadingService.stopLoading();
      }
    );
  }

  public isAnError(idRow: number, idColumn: number) {
    const position = idRow.toString() + "_" + idColumn.toString();
    return this.errorsId.indexOf(position) > -1;
  }

  public countErrors(variable: boolean, idRow: number, idColumn: number) {
    if (
      this.datas[idRow][STATUT_DOM] === "REFUS" &&
      (idColumn === DATE_DEBUT_DOM ||
        idColumn === DATE_FIN_DOM ||
        idColumn === DATE_PREMIERE_DOM)
    ) {
      variable = true;
      return true;
    }

    this.errorsColumn[idColumn] === undefined
      ? (this.errorsColumn[idColumn] = 1)
      : this.errorsColumn[idColumn]++;
    const position = idRow.toString() + "_" + idColumn.toString();

    if (variable !== true) {
      if (this.errorsRow[idRow] === undefined) {
        this.errorsRow[idRow] = [];
      }

      this.errorsRow[idRow].push(idColumn);
      this.errorsId.push(position);
    }
    return variable;
  }

  public notEmpty(value: string): boolean {
    return value !== undefined && value !== null && value !== "";
  }

  public validDate(date: string, required: boolean): boolean {
    if ((date === undefined || date === null || date === "") && !required) {
      return true;
    }

    return RegExp(regexp.date).test(date);
  }

  public validPhone(phone: string): boolean {
    if (!phone || phone === null || phone === "") {
      return true;
    }

    return RegExp(regexp.phone).test(phone.replace(/\D/g, ""));
  }

  public validEmail(email: string): boolean {
    if (!email || email === null || email === "") {
      return true;
    }
    return RegExp(regexp.email).test(email);
  }

  public isValidValue(data: string, rowName: string, required?: boolean) {
    if ((data === undefined || data === null || data === "") && !required) {
      return true;
    }

    const types: {
      [key: string]: any;
    } = {
      demande: ["PREMIERE", "RENOUVELLEMENT"],
      lienParente: ["ENFANT", "CONJOINT", "PARENT", "AUTRE", "AUTRES"],
      menage: [
        "HOMME_ISOLE_SANS_ENFANT",
        "FEMME_ISOLE_SANS_ENFANT",
        "HOMME_ISOLE_AVEC_ENFANT",
        "FEMME_ISOLE_AVEC_ENFANT",
        "COUPLE_SANS_ENFANT",
        "COUPLE_AVEC_ENFANT",
        "MINEUR"
      ],
      motifRadiation: [
        "NON_MANIFESTATION_3_MOIS",
        "A_SA_DEMANDE",
        "ENTREE_LOGEMENT",
        "FIN_DE_DOMICILIATION",
        "PLUS_DE_LIEN_COMMUNE",
        "NON_RESPECT_REGLEMENT",
        "AUTRE",
        "AUTRES"
      ],
      motifRefus: [
        "LIEN_COMMUNE",
        "SATURATION",
        "HORS_AGREMENT",
        "AUTRE",
        "AUTRES"
      ],
      statut: ["VALIDE", "REFUS", "RADIE"]
    };
    return types[rowName].indexOf(data) > -1;
  }

  public reload() {
    location.reload();
  }
}
