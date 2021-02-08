import * as XLSX from "xlsx";
import moment from "moment";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { regexp } from "../../../../shared/validators";

import { UsagerService } from "../../services/usager.service";
import { AuthService } from "../../../shared/services/auth.service";
import { LoadingService } from "../../../loading/loading.service";

import { AppUser } from "../../../../../_common/model";
import { COLUMNS_HEADERS } from "../../../../../_common/import/COLUMNS_HEADERS.const";
import {
  isValidEmail,
  isValidPhone,
  isValidValue,
  notEmpty,
} from "../../../../../_common/import/import.validators";

type AOA = any[][];

@Component({
  providers: [UsagerService],
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

  public etapeImport: number;

  public today: Date;
  public minDate: Date;
  public nextYear: Date;

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

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.columnsHeaders = COLUMNS_HEADERS;

    // Variables de suivi des erreurs
    this.etapeImport = 0;
    this.uploadError = false;

    // Tableaux des erreurs
    this.errorsId = [];

    this.errorsRow = [];
    this.showErrors = false;
    this.showTable = false;

    this.today = moment().endOf("day").toDate();
    this.nextYear = moment().add(1, "year").endOf("day").toDate();
    this.minDate = moment.utc("01/01/1900", "DD/MM/YYYY").endOf("day").toDate();
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
      fileInput: ["", Validators.required],
    });
  }

  public onFileChange(event: Event) {
    this.loadingService.startLoading();
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

    this.showTable = true;
    this.etapeImport = 1;
    this.datas = [[], []];

    const file = input.files[0];
    this.uploadForm.controls.fileInput.setValue(file);

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {
        dateNF: "dd/mm/yyyy",
        type: "binary",
      });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.datas = XLSX.utils.sheet_to_json(ws, {
        blankrows: false,
        dateNF: "dd/mm/yyyy",
        header: 1,
        raw: false,
      }) as AOA;

      // Suppression de la colonne header
      this.datas = this.datas.slice(1);

      this.datas.forEach((row, rowIndex: number) => {
        const sexeCheck =
          row[this.CIVILITE] === "H" || row[this.CIVILITE] === "F";
        this.countErrors(sexeCheck, rowIndex, this.CIVILITE);

        this.countErrors(notEmpty(row[this.NOM]), rowIndex, this.NOM);
        this.countErrors(notEmpty(row[this.PRENOM]), rowIndex, this.PRENOM);

        this.countErrors(
          this.isValidDate(row[this.DATE_NAISSANCE], true, false),
          rowIndex,
          this.DATE_NAISSANCE
        );

        this.countErrors(
          notEmpty(row[this.LIEU_NAISSANCE]),
          rowIndex,
          this.LIEU_NAISSANCE
        );

        this.countErrors(isValidEmail(row[this.EMAIL]), rowIndex, this.EMAIL);

        this.countErrors(isValidPhone(row[this.PHONE]), rowIndex, this.PHONE);

        this.countErrors(
          isValidValue(row[this.STATUT_DOM], "statut", true),
          rowIndex,
          this.STATUT_DOM
        );

        this.countErrors(
          isValidValue(row[this.TYPE_DOM], "demande", true),
          rowIndex,
          this.TYPE_DOM
        );

        // SI Refus & Radié, on ne tient pas compte des dates suivantes : date de début, date de fin, date de dernier passage
        const dateIsRequired =
          row[this.STATUT_DOM] !== "REFUS" && row[this.STATUT_DOM] !== "RADIE";

        this.countErrors(
          this.isValidDate(row[this.DATE_DEBUT_DOM], dateIsRequired, false),
          rowIndex,
          this.DATE_DEBUT_DOM
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_FIN_DOM], dateIsRequired, true),
          rowIndex,
          this.DATE_FIN_DOM
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_PREMIERE_DOM], false, false),
          rowIndex,
          this.DATE_PREMIERE_DOM
        );

        this.countErrors(
          this.isValidDate(
            row[this.DATE_DERNIER_PASSAGE],
            dateIsRequired,
            false
          ),
          rowIndex,
          this.DATE_DERNIER_PASSAGE
        );

        this.countErrors(
          isValidValue(row[this.MOTIF_REFUS], "motifRefus"),
          rowIndex,
          this.MOTIF_REFUS
        );

        this.countErrors(
          isValidValue(row[this.MOTIF_RADIATION], "motifRadiation"),
          rowIndex,
          this.MOTIF_RADIATION
        );

        this.countErrors(
          isValidValue(row[this.COMPOSITION_MENAGE], "menage"),
          rowIndex,
          this.COMPOSITION_MENAGE
        );

        this.countErrors(
          isValidValue(row[this.CAUSE_INSTABILITE], "cause"),
          rowIndex,
          this.CAUSE_INSTABILITE
        );

        this.countErrors(
          isValidValue(row[this.SITUATION_RESIDENTIELLE], "residence"),
          rowIndex,
          this.SITUATION_RESIDENTIELLE
        );

        this.countErrors(
          isValidValue(row[this.ORIENTATION], "choix"),
          rowIndex,
          this.ORIENTATION
        );

        this.countErrors(
          isValidValue(row[this.DOMICILIATION_EXISTANTE], "choix"),
          rowIndex,
          this.DOMICILIATION_EXISTANTE
        );

        this.countErrors(
          isValidValue(row[this.REVENUS], "choix"),
          rowIndex,
          this.REVENUS
        );

        this.countErrors(
          isValidValue(row[this.ACCOMPAGNEMENT], "choix"),
          rowIndex,
          this.ACCOMPAGNEMENT
        );

        // CHoix OUI OU NON

        for (const indexAD of this.AYANT_DROIT) {
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
            this.countErrors(notEmpty(nom), rowIndex, indexAD);
            this.countErrors(notEmpty(prenom), rowIndex, indexAD + 1);

            this.countErrors(
              this.isValidDate(dateNaissance, true, false),
              rowIndex,
              indexAD + 2
            );

            this.countErrors(
              isValidValue(lienParente, "lienParente", true),
              rowIndex,
              indexAD + 3
            );
          }
        }

        if (rowIndex === this.datas.length - 1) {
          console.log("fin du chargement");
          this.loadingService.startLoading();
        }
      });
    };

    reader.readAsBinaryString(file);
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

  public isAnError(idRow: number, idColumn: number) {
    const position = idRow.toString() + "_" + idColumn.toString();
    return this.errorsId.indexOf(position) > -1;
  }

  public countErrors(variable: boolean, idRow: number, idColumn: number): void {
    const position = idRow.toString() + "_" + idColumn.toString();

    if (variable !== true) {
      if (this.errorsRow[idRow] === undefined) {
        this.errorsRow[idRow] = [];
      }
      this.errorsRow[idRow].push(idColumn);
      this.errorsId.push(position);
    }
  }

  // Vérification des différents champs Date
  public isValidDate(
    date: string,
    required: boolean,
    futureDate: boolean
  ): boolean {
    if (!notEmpty(date)) {
      return !required;
    }

    if (RegExp(regexp.date).test(date)) {
      if (!moment.utc(date, "DD/MM/YYYY").isValid()) {
        return false;
      }

      const dateToCheck = moment
        .utc(date, "DD/MM/YYYY")
        .startOf("day")
        .toDate();

      // S'il s'agit d'une date dans le futur, on compare à N+1
      return futureDate
        ? dateToCheck >= this.minDate && dateToCheck <= this.nextYear
        : dateToCheck >= this.minDate && dateToCheck <= this.today;
    }
    return false;
  }

  // Vérification des champs pré-remplis dans les liste déroulantes

  public reload() {
    location.reload();
  }
}
