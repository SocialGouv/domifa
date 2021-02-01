import * as XLSX from "xlsx";

import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { regexp } from "../../../../shared/validators";

import { UsagerService } from "../../services/usager.service";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../../shared/services/auth.service";
import { LoadingService } from "../../../loading/loading.service";
import { AppUser } from "../../../../../_common/model";

import moment from "moment";

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

  public errorsId: any[];
  public errorsColumn = new Array(32);
  public errorsRow: any[];

  public rowNumber: number;
  public colNames: string[];
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
    this.canUpload = false;
    this.colNames = colNames;
    this.errorsId = [];
    this.errorsList = {};
    this.errorsRow = [];

    this.etapeImport = 0;
    this.fileName = "";
    this.nbreAyantsDroits = [33, 37, 41, 45, 49, 53, 57, 61, 65];
    this.rowNumber = 0;
    this.showErrors = false;
    this.showTable = false;
    this.success = false;
    this.uploadError = false;

    this.today = new Date();
    this.nextYear = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    );

    for (let cpt = 0; cpt < 10; cpt++) {
      this.colNames.push("Ayant-droit " + cpt + ": nom");
      this.colNames.push("Ayant-droit " + cpt + ": prénom");
      this.colNames.push("Ayant-droit " + cpt + ": date naissance");
      this.colNames.push("Ayant-droit " + cpt + ": lien parenté");
    }

    this.today = moment().utc().endOf("day").toDate();
    this.nextYear = moment().utc().endOf("year").toDate();
    this.minDate = moment("01/01/1900", "DD/MM/YYYY")
      .utc()
      .endOf("day")
      .toDate();
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

    for (let index = 0; index < 32; index++) {
      this.errorsColumn[index] = 10;
    }

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
    this.datas = [[], []];
    this.etapeImport = 1;
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

      this.datas = this.datas.slice(1);
      this.datas.forEach((row, index: any) => {
        this.rowNumber = index;

        const sexeCheck =
          row[this.CIVILITE] === "H" || row[this.CIVILITE] === "F";
        this.countErrors(sexeCheck, index, this.CIVILITE);

        this.countErrors(this.notEmpty(row[this.NOM]), index, this.NOM);
        this.countErrors(this.notEmpty(row[this.PRENOM]), index, this.PRENOM);

        this.countErrors(
          this.isValidDate(row[this.DATE_NAISSANCE], true, false),
          index,
          this.DATE_NAISSANCE
        );

        this.countErrors(
          this.notEmpty(row[this.LIEU_NAISSANCE]),
          index,
          this.LIEU_NAISSANCE
        );

        this.countErrors(this.isValidEmail(row[this.EMAIL]), index, this.EMAIL);

        this.countErrors(this.isValidPhone(row[this.PHONE]), index, this.PHONE);

        this.countErrors(
          this.isValidValue(row[this.STATUT_DOM], "statut", true),
          index,
          this.STATUT_DOM
        );

        this.countErrors(
          this.isValidValue(row[this.TYPE_DOM], "demande", true),
          index,
          this.TYPE_DOM
        );

        // SI Refus & Radié, on ne tient pas compte des dates suivantes : date de début, date de fin, date de dernier passage
        const dateIsRequired =
          row[this.STATUT_DOM] !== "REFUS" && row[this.STATUT_DOM] !== "RADIE";

        this.countErrors(
          this.isValidDate(row[this.DATE_DEBUT_DOM], dateIsRequired, false),
          index,
          this.DATE_DEBUT_DOM
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_FIN_DOM], dateIsRequired, true),
          index,
          this.DATE_FIN_DOM
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_PREMIERE_DOM], false, false),
          index,
          this.DATE_PREMIERE_DOM
        );

        this.countErrors(
          this.isValidDate(
            row[this.DATE_DERNIER_PASSAGE],
            dateIsRequired,
            false
          ),
          index,
          this.DATE_DERNIER_PASSAGE
        );

        this.countErrors(
          this.isValidValue(row[this.MOTIF_REFUS], "motifRefus"),
          index,
          this.MOTIF_REFUS
        );

        this.countErrors(
          this.isValidValue(row[this.MOTIF_RADIATION], "motifRadiation"),
          index,
          this.MOTIF_RADIATION
        );

        this.countErrors(
          this.isValidValue(row[this.COMPOSITION_MENAGE], "menage"),
          index,
          this.COMPOSITION_MENAGE
        );

        this.countErrors(
          this.isValidValue(row[this.CAUSE_INSTABILITE], "cause"),
          index,
          this.CAUSE_INSTABILITE
        );

        this.countErrors(
          this.isValidValue(row[this.SITUATION_RESIDENTIELLE], "residence"),
          index,
          this.SITUATION_RESIDENTIELLE
        );

        this.countErrors(
          this.isValidValue(row[this.ORIENTATION], "choix"),
          index,
          this.ORIENTATION
        );

        this.countErrors(
          this.isValidValue(row[this.DOMICILIATION_EXISTANTE], "choix"),
          index,
          this.DOMICILIATION_EXISTANTE
        );

        this.countErrors(
          this.isValidValue(row[this.REVENUS], "choix"),
          index,
          this.REVENUS
        );

        this.countErrors(
          this.isValidValue(row[this.ACCOMPAGNEMENT], "choix"),
          index,
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
            this.countErrors(this.notEmpty(nom), this.rowNumber, indexAD);
            this.countErrors(
              this.notEmpty(prenom),
              this.rowNumber,
              indexAD + 1
            );

            this.countErrors(
              this.isValidDate(dateNaissance, true, false),
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

  public countErrors(variable: boolean, idRow: number, idColumn: number) {
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
    return (
      typeof value !== "undefined" && value !== null && value.trim() !== ""
    );
  }

  // Vérification des différents champs Date
  public isValidDate(
    date: string,
    required: boolean,
    futureDate: boolean
  ): boolean {
    if (!this.notEmpty(date)) {
      return !required;
    }

    if (RegExp(regexp.date).test(date)) {
      if (!moment(date, "DD/MM/YYYY").isValid()) {
        return false;
      }

      const dateToCheck = moment(date, "DD/MM/YYYY")
        .utc()
        .startOf("day")
        .toDate();

      // S'il s'agit d'une date dans le futur, on compare à N+1
      return futureDate
        ? dateToCheck >= this.minDate && dateToCheck <= this.nextYear
        : dateToCheck >= this.minDate && dateToCheck <= this.today;
    }
    return false;
  }

  private isValidPhone(phone: string): boolean {
    return !this.notEmpty(phone)
      ? true
      : RegExp(regexp.phone).test(phone.replace(/\D/g, ""));
  }

  private isValidEmail(email: string): boolean {
    return !this.notEmpty(email) ? true : RegExp(regexp.email).test(email);
  }

  // Vérification des champs pré-remplis dans les liste déroulantes
  public isValidValue(
    data: string,
    rowName: string,
    required?: boolean
  ): boolean {
    if (!this.notEmpty(data)) {
      return !required;
    }

    const types: {
      [key: string]: any;
    } = {
      demande: ["PREMIERE", "RENOUVELLEMENT"],
      lienParente: ["ENFANT", "CONJOINT", "PARENT", "AUTRE"],
      menage: [
        "HOMME_ISOLE_SANS_ENFANT",
        "FEMME_ISOLE_SANS_ENFANT",
        "HOMME_ISOLE_AVEC_ENFANT",
        "FEMME_ISOLE_AVEC_ENFANT",
        "COUPLE_SANS_ENFANT",
        "COUPLE_AVEC_ENFANT",
      ],
      motifRadiation: [
        "NON_MANIFESTATION_3_MOIS",
        "A_SA_DEMANDE",
        "ENTREE_LOGEMENT",
        "FIN_DE_DOMICILIATION",
        "PLUS_DE_LIEN_COMMUNE",
        "NON_RESPECT_REGLEMENT",
        "AUTRE",
      ],
      motifRefus: ["LIEN_COMMUNE", "SATURATION", "HORS_AGREMENT", "AUTRE"],
      residence: [
        "DOMICILE_MOBILE",
        "HEBERGEMENT_SOCIAL",
        "HEBERGEMENT_TIERS",
        "HOTEL",
        "SANS_ABRI",
        "AUTRE",
      ],
      cause: [
        "ERRANCE",
        "AUTRE",
        "EXPULSION",
        "HEBERGE_SANS_ADRESSE",
        "ITINERANT",
        "RUPTURE",
        "SORTIE_STRUCTURE",
        "VIOLENCE",
      ],
      statut: ["VALIDE", "REFUS", "RADIE"],
      raison: ["EXERCICE_DROITS", "PRESTATIONS_SOCIALES", "AUTRE"],
      choix: ["OUI", "NON"],
    };

    return types[rowName].indexOf(data.toUpperCase()) > -1;
  }

  public reload() {
    location.reload();
  }
}
