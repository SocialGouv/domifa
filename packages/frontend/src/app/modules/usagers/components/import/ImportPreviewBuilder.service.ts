import { Injectable } from "@angular/core";
import moment from "moment";
import { regexp } from "../../../../shared/validators";
import { IMPORT_PREVIEW_COLUMNS } from "./IMPORT_PREVIEW_COLUMNS.const";

export type ImportPreviewTable = {
  rows: ImportPreviewRow[];
  isValid: boolean;
  errorsCount: number;
};
export type ImportPreviewRow = {
  rowIndex: number;
  isValid: boolean;
  errorsCount: number;
  columns: { [attributeName: string]: ImportPreviewColumn };
};
export type ImportPreviewColumn = {
  value: any;
  isValid: boolean;
};
const COL = IMPORT_PREVIEW_COLUMNS;

@Injectable()
export class ImportPreviewBuilder {
  constructor() {}
  public buildPreviewTable(datas: any[][]): ImportPreviewTable {
    const today = moment.utc().endOf("day").toDate();
    const nextYear = moment.utc().add(1, "year").endOf("day").toDate();
    const minDate = moment
      .utc("01/01/1900", "DD/MM/YYYY")
      .endOf("day")
      .toDate();
    const rows: ImportPreviewRow[] = datas.map((rowData, rowIndex) => {
      const row: ImportPreviewRow = {
        rowIndex,
        columns: {},
        isValid: true,
        errorsCount: 0,
      };
      // SI Refus & Radié, on ne tient pas compte des dates suivantes : date de début, date de fin, date de dernier passage
      const dateIsRequired =
        rowData[COL.STATUT_DOM] !== "REFUS" &&
        rowData[COL.STATUT_DOM] !== "RADIE";

      for (let i = 0; i < COL.AYANT_DROIT[0]; i++) {
        const value = rowData[i];
        const columnIndex = i;

        let isValidColumn = true;
        switch (columnIndex) {
          case COL.DATE_NAISSANCE:
            if (
              !this.isValidDate({
                date: value,
                required: true,
                futureDate: false,
                today,
                nextYear,
                minDate,
              })
            ) {
              isValidColumn = false;
            }
            break;
          case COL.EMAIL:
            if (!this.isValidEmail(value)) {
              isValidColumn = false;
            }
            break;
          case COL.PHONE:
            if (!this.isValidPhone(value)) {
              isValidColumn = false;
            }
            break;
          case COL.CIVILITE:
            if (!(value === "H" || value === "F")) {
              isValidColumn = false;
            }
            break;
          case COL.NOM:
          case COL.PRENOM:
          case COL.LIEU_NAISSANCE:
            if (!this.isNotEmpty(value)) {
              isValidColumn = false;
            }
            break;
          case COL.STATUT_DOM:
            if (!this.isValidValue(value, "statut", true)) {
              isValidColumn = false;
            }
            break;
          case COL.TYPE_DOM:
            if (!this.isValidValue(value, "demande", true)) {
              isValidColumn = false;
            }
            break;
          case COL.DATE_DEBUT_DOM:
            if (
              !this.isValidDate({
                date: value,
                required: dateIsRequired,
                futureDate: false,
                today,
                nextYear,
                minDate,
              })
            ) {
              isValidColumn = false;
            }
            break;
          case COL.DATE_DERNIER_PASSAGE:
            if (
              !this.isValidDate({
                date: value,
                required: false,
                futureDate: false,
                today,
                nextYear,
                minDate,
              })
            ) {
              isValidColumn = false;
            }
            break;
          case COL.DATE_FIN_DOM:
            if (
              !this.isValidDate({
                date: value,
                required: dateIsRequired,
                futureDate: true,
                today,
                nextYear,
                minDate,
              })
            ) {
              isValidColumn = false;
            }
            break;
          case COL.DATE_PREMIERE_DOM:
            if (
              !this.isValidDate({
                date: value,
                required: false,
                futureDate: false,
                today,
                nextYear,
                minDate,
              })
            ) {
              isValidColumn = false;
            }
            break;
          case COL.MOTIF_REFUS:
            if (!this.isValidValue(value, "motifRefus")) {
              isValidColumn = false;
            }
            break;
          case COL.MOTIF_RADIATION:
            if (!this.isValidValue(value, "motifRadiation")) {
              isValidColumn = false;
            }
            break;
          case COL.COMPOSITION_MENAGE:
            if (!this.isValidValue(value, "menage")) {
              isValidColumn = false;
            }
            break;
          case COL.RAISON_DEMANDE:
            if (!this.isValidValue(value, "raison")) {
              isValidColumn = false;
            }
            break;
          case COL.CAUSE_INSTABILITE:
            if (!this.isValidValue(value, "cause")) {
              isValidColumn = false;
            }
            break;
          case COL.SITUATION_RESIDENTIELLE:
            if (!this.isValidValue(value, "residence")) {
              isValidColumn = false;
            }
            break;
          case COL.ORIENTATION:
          case COL.DOMICILIATION_EXISTANTE:
          case COL.REVENUS:
          case COL.ACCOMPAGNEMENT:
            // Choix OUI OU NON
            if (!this.isValidValue(value, "choix")) {
              isValidColumn = false;
            }
            break;
        }
        if (columnIndex < COL.AYANT_DROIT[0]) {
          row.isValid = row.isValid && isValidColumn;
          row.columns[columnIndex] = {
            isValid: isValidColumn,
            value,
          };
          if (!isValidColumn) {
            row.errorsCount++;
          }
        }
      }

      for (const indexAD of COL.AYANT_DROIT) {
        const nom = rowData[indexAD];
        const prenom = rowData[indexAD + 1];
        const dateNaissance = rowData[indexAD + 2];
        const lienParente = rowData[indexAD + 3];

        const isAyantDroitDefined =
          typeof nom !== "undefined" ||
          typeof prenom !== "undefined" ||
          typeof dateNaissance !== "undefined" ||
          typeof lienParente !== "undefined";

        row.columns[indexAD] = {
          isValid: !isAyantDroitDefined || this.isNotEmpty(nom),
          value: nom,
        };
        row.columns[indexAD + 1] = {
          isValid: !isAyantDroitDefined || this.isNotEmpty(prenom),
          value: prenom,
        };
        row.columns[indexAD + 2] = {
          isValid:
            !isAyantDroitDefined ||
            this.isValidDate({
              date: dateNaissance,
              required: true,
              futureDate: false,
              today,
              nextYear,
              minDate,
            }),
          value: dateNaissance,
        };
        row.columns[indexAD + 3] = {
          isValid:
            !isAyantDroitDefined ||
            this.isValidValue(lienParente, "lienParente", true),
          value: lienParente,
        };
        if (!row.columns[indexAD].isValid) {
          row.errorsCount++;
        }
        if (!row.columns[indexAD + 1].isValid) {
          row.errorsCount++;
        }
        if (!row.columns[indexAD + 2].isValid) {
          row.errorsCount++;
        }
        if (!row.columns[indexAD + 3].isValid) {
          row.errorsCount++;
        }
        const isValidAyantDroit =
          row.columns[indexAD].isValid &&
          row.columns[indexAD + 1].isValid &&
          row.columns[indexAD + 2].isValid &&
          row.columns[indexAD + 3].isValid;
        row.isValid = row.isValid && isValidAyantDroit;
      }

      return row;
    });
    const tableErrorCounts = rows.reduce((total, r) => {
      return total + r.errorsCount;
    }, 0);
    const table: ImportPreviewTable = {
      rows,
      isValid: tableErrorCounts === 0,
      errorsCount: tableErrorCounts,
    };
    return table;
  }

  public isValidDate({
    date,
    required,
    futureDate,
    today,
    nextYear,
    minDate,
    debug,
  }: {
    date: string;
    required: boolean;
    futureDate: boolean;
    today: Date;
    nextYear: Date;
    minDate: Date;
    debug?: boolean;
  }): boolean {
    // Vérification des différents champs Date
    if (!this.isNotEmpty(date)) {
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
        ? dateToCheck >= minDate && dateToCheck <= nextYear
        : dateToCheck >= minDate && dateToCheck <= today;
    }
    return false;
  }

  // Vérification : téléphone
  public isValidPhone(phone: string): boolean {
    if (!this.isNotEmpty(phone)) {
      return true;
    }

    return RegExp(regexp.phone).test(phone.replace(/\D/g, ""));
  }

  // Vérification : Email
  public isValidEmail(email: string): boolean {
    if (!this.isNotEmpty(email)) {
      return true;
    }

    const isValid = RegExp(regexp.email).test(email);

    return isValid;
  }

  // Vérification des champs pré-remplis dans les liste déroulantes
  public isValidValue(
    data: string,
    rowName: string,
    required?: boolean
  ): boolean {
    if (!this.isNotEmpty(data)) {
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

  public isNotEmpty(value: string): boolean {
    return value !== undefined && value !== null && value.trim() !== "";
  }
}
