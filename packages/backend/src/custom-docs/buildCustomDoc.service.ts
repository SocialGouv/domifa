import moment = require("moment");
import { UsagerLight } from "../database";
import {
  motifsRefus,
  motifsRadiation,
  decisionLabels,
  typeMenage,
  residence,
} from "../stats/usagers.labels";
import { notEmpty } from "../_common/import/import.validators";
import { StructureCommon } from "../_common/model";

import { StructureCustomDoc } from "../_common/model/structure-doc/StructureCustomDoc.type";

export function buildCustomDoc(
  usager: UsagerLight,
  structure: StructureCommon
): StructureCustomDoc {
  // Adresse
  let adresseStructure = ucFirst(structure.adresse);

  if (notEmpty(structure.complementAdresse)) {
    adresseStructure =
      adresseStructure + ", " + ucFirst(structure.complementAdresse);
  }

  // Motif de refus

  if (
    usager.decision.statut === "REFUS" ||
    usager.decision.statut === "RADIE"
  ) {
    if (usager.decision.motif === "AUTRE") {
      usager.decision.motif =
        usager.decision.motifDetails !== ""
          ? "Autre motif" + usager.decision.motifDetails
          : ("Autre motif non précisé" as any);
    } else {
      usager.decision.motif =
        usager.decision.statut === "REFUS"
          ? motifsRefus[usager.decision.motif]
          : (motifsRadiation[usager.decision.motif] as any);
    }
  } else {
    usager.decision.motif = "" as any;
  }

  return {
    // DATES UTILES
    DATE_JOUR: moment().locale("fr").format("L"),
    DATE_JOUR_HEURE:
      moment().locale("fr").format("L") + " à " + moment().format("LT"),
    DATE_JOUR_LONG: moment().locale("fr").format("LL"),

    // INFOS RESPONSABLE
    RESPONSABLE_NOM: ucFirst(structure.responsable.nom),
    RESPONSABLE_PRENOM: ucFirst(structure.responsable.prenom),
    RESPONSABLE_FONCTION: structure.responsable.fonction,

    // INFOS STRUCTURE
    STRUCTURE_NOM: ucFirst(structure.nom),
    STRUCTURE_TYPE: "Type de structure",
    STRUCTURE_ADRESSE: adresseStructure,

    STRUCTURE_COMPLEMENT_ADRESSE: "",
    STRUCTURE_VILLE: ucFirst(structure.ville),
    STRUCTURE_CODE_POSTAL: structure.codePostal,

    // ADRESSE COURRIER
    STRUCTURE_COURRIER_ADRESSE: "",
    STRUCTURE_COURRIER_COMPLEMENT_ADRESSE: "",
    STRUCTURE_COURRIER_VILLE: "",
    STRUCTURE_COURRIER_CODE_POSTAL: "",

    // INFOS USAGER
    USAGER_REF: usager.ref.toString(),
    USAGER_CUSTOM_REF: usager.customRef,
    USAGER_CIVILITE: usager.sexe === "femme" ? "Madame" : "Monsieur",
    USAGER_NOM: ucFirst(usager.nom),
    USAGER_PRENOM: ucFirst(usager.prenom),
    USAGER_SURNOM: ucFirst(usager.surnom) || "",
    USAGER_DATE_NAISSANCE: moment(usager.dateNaissance)
      .locale("fr")
      .format("L"),

    USAGER_LIEU_NAISSANCE: ucFirst(usager.villeNaissance),

    // CONTACT USAGER
    USAGER_PHONE: usager.phone || "",
    USAGER_EMAIL: usager.email || "",

    // STATUT ET TYPE DE DOM
    STATUT_DOM: decisionLabels[usager.decision.statut],
    TYPE_DOM:
      "Type de domiciliation : première domiciliation ou renouvellement",

    // REFUS / RADIATION
    MOTIF_RADIATION: usager.decision.motif,
    DATE_RADIATION: moment(usager.decision.dateDecision)
      .locale("fr")
      .format("LL"),

    // DATES DOMICILIATION
    DATE_DEBUT_DOM: moment(usager.decision.dateDebut).locale("fr").format("LL"),
    DATE_FIN_DOM: moment(usager.decision.dateFin).locale("fr").format("LL"),

    DATE_PREMIERE_DOM: moment(usager.datePremiereDom).locale("fr").format("LL"),

    DATE_DERNIER_PASSAGE: moment(usager.lastInteraction.dateInteraction)
      .locale("fr")
      .format("LL"),

    // ENTRETIEN

    ENTRETIEN_CAUSE_INSTABILITE: "Cause instabilité logement",
    ENTRETIEN_RAISON_DEMANDE: "Motif principal de la demande",
    ENTRETIEN_ACCOMPAGNEMENT: "Accompagnement social",

    ENTRETIEN_ORIENTE_PAR: usager.entretien.orientation
      ? "Oui: " + usager.entretien.orientationDetail
      : "Non",

    ENTRETIEN_DOMICILIATION_EXISTANTE: usager.entretien.domiciliation
      ? "OUI"
      : "NON",

    ENTRETIEN_REVENUS: usager.entretien.revenus
      ? "OUI" + usager.entretien.revenusDetail
      : "NON",

    ENTRETIEN_LIEN_COMMUNE: usager.entretien.liencommune || "",

    ENTRETIEN_COMPOSITION_MENAGE: typeMenage[usager.entretien.typeMenage],

    ENTRETIEN_SITUATION_RESIDENTIELLE:
      usager.entretien.residence === "AUTRE"
        ? " Autre : " + usager.entretien.residenceDetail
        : residence[usager.entretien.residence],
  };
}

function ucFirst(value: string) {
  return value === undefined || value === null
    ? ""
    : value.charAt(0).toUpperCase() + value.slice(1);
}
