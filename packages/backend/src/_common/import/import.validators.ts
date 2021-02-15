import moment = require("moment");
import { appLogger } from "../../util";

export const regexp = {
  date: /^([0-9]|[0-2][0-9]|(3)[0-1])(\/)(([0-9]|(0)[0-9])|((1)[0-2]))(\/)\d{4}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // tslint:disable max-line-length
  phone: /^((\+)33|0)[1-9](\d{2}){4}$/,
  postcode: /^[0-9][0-9AB][0-9]{3}$/,
};

export function notEmpty(value: string): boolean {
  return typeof value !== "undefined" && value !== null && value.trim() !== "";
}

export function isValidPhone(phone: string): boolean {
  const isValid = !notEmpty(phone)
    ? true
    : RegExp(regexp.phone).test(phone.replace(/\D/g, ""));
  if (!isValid) {
    appLogger.warn(`Invalid phone`, {
      sentryBreadcrumb: true,
      extra: {
        phone,
      },
    });
  }
  return isValid;
}

export function isValidEmail(email: string): boolean {
  const isValid = !notEmpty(email) ? true : RegExp(regexp.email).test(email);
  if (!isValid) {
    appLogger.warn(`Invalid email`, {
      sentryBreadcrumb: true,
      extra: {
        email,
      },
    });
  }
  return isValid;
}

export function isValidValue(
  data: string,
  rowName: string,
  required: boolean = false
): boolean {
  if (!notEmpty(data)) {
    return !required;
  }

  const authorizedValues: any = {
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

  const isValid = authorizedValues[rowName].indexOf(data.toUpperCase()) > -1;
  if (!isValid) {
    appLogger.warn(`Invalid value`, {
      sentryBreadcrumb: true,
      extra: {
        data,
        rowName,
        required,
      },
    });
  }
  return isValid;
}

// Vérification des différents champs Date
export function isValidDate(
  date: string,
  {
    required,
    minDate,
    maxDate,
  }: {
    required: boolean;
    minDate: Date;
    maxDate: Date;
  }
): boolean {
  if (!notEmpty(date)) {
    return !required;
  }

  if (RegExp(regexp.date).test(date)) {
    const momentDate = moment.utc(date, "DD/MM/YYYY");
    if (momentDate.isValid()) {
      const dateToCheck = momentDate.startOf("day").toDate();

      const isValidDate = dateToCheck >= minDate && dateToCheck <= maxDate;
      if (!isValidDate) {
        appLogger.warn(`Invalid date`, {
          sentryBreadcrumb: true,
          extra: {
            date,
            dateToCheck,
            maxDate,
          },
        });
      }
      return isValidDate;
    }
  }
  return false;
}
