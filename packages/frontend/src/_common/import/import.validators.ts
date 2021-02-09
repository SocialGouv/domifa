import { regexp } from "../../app/shared/validators";

export function notEmpty(value: string): boolean {
  return typeof value !== "undefined" && value !== null && value.trim() !== "";
}

export function isValidPhone(phone: string): boolean {
  return !notEmpty(phone)
    ? true
    : RegExp(regexp.phone).test(phone.replace(/\D/g, ""));
}

export function isValidEmail(email: string): boolean {
  return !notEmpty(email) ? true : RegExp(regexp.email).test(email);
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

  return authorizedValues[rowName].indexOf(data.toUpperCase()) > -1;
}
