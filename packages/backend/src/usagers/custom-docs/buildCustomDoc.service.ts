import { residence, typeMenage } from "../../stats/usagers.labels";
import { StructureCommon, UsagerLight } from "../../_common/model";
import { StructureCustomDocTags } from "../../_common/model/structure-doc/StructureCustomDocTags.type";
import { USAGER_DECISION_STATUT_LABELS } from "./../../_common/labels/USAGER_DECISION_STATUT_LABELS.const";
import { UsagerDecision } from "./../../_common/model/usager/UsagerDecision.type";
import { generateMotifLabel } from "./../services/generateMotifLabel.service";

import moment = require("moment");

import { format } from "date-fns";

export function buildCustomDoc({
  usager,
  structure,
  date,
  extraParameters = {},
}: {
  usager: UsagerLight;
  structure: StructureCommon;
  date?: Date;
  extraParameters?: { [name: string]: string };
}): StructureCustomDocTags {
  // Date
  const dateOfDocument = date ? moment(date) : moment();

  // Adresse courrier active
  const isDifferentAddress =
    structure.adresseCourrier !== null && structure.adresseCourrier?.actif;
  // Adresse
  let adresseStructure = ucFirst(structure.adresse);

  if (notEmpty(structure.complementAdresse)) {
    adresseStructure =
      adresseStructure + ", " + ucFirst(structure.complementAdresse);
  }

  let dateDebutDom: Date;
  let dateFinDom: Date;

  if (usager.decision.statut === "RADIE") {
    usager.historique.forEach((decision: UsagerDecision) => {
      if (decision.statut === "VALIDE") {
        // Premiere décision retenue
        if (!dateDebutDom) {
          dateDebutDom = decision.dateDebut;
          dateFinDom = decision.dateFin;
        }

        // Si une décision plus récente est présente
        if (dateDebutDom < decision.dateDebut) {
          dateDebutDom = decision.dateDebut;
          dateFinDom = decision.dateFin;
        }
      }
    });

    // Aucune date défini, on cherche la date de premième Dom
    if (!dateDebutDom || !dateFinDom) {
      // Date de premiere Dom par défaut
      if (usager.datePremiereDom) {
        dateDebutDom = usager.datePremiereDom;
        dateFinDom = usager.datePremiereDom;
      }
      // Cas rares : on met une date par défaut
      else {
        dateDebutDom = usager.decision.dateDebut;
        dateFinDom = usager.decision.dateFin;
      }
    }
  } else {
    dateDebutDom = usager.decision.dateDebut;
    dateFinDom = usager.decision.dateFin;
  }

  // Motif de refus
  const motif = generateMotifLabel(usager.decision);
  // Procu & transfert
  const procuration = usager.options.procuration;
  const transfert = usager.options.transfert;

  return {
    // DATES UTILES
    DATE_JOUR: dateOfDocument.locale("fr").format("L"),
    DATE_JOUR_HEURE:
      dateOfDocument.locale("fr").format("L") +
      " à " +
      dateOfDocument.format("LT"),
    DATE_JOUR_LONG: dateOfDocument.locale("fr").format("LL"),

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
    STRUCTURE_COURRIER_ADRESSE: isDifferentAddress
      ? ucFirst(structure.adresseCourrier.adresse)
      : adresseStructure,

    STRUCTURE_COURRIER_VILLE: isDifferentAddress
      ? ucFirst(structure.adresseCourrier.ville)
      : ucFirst(structure.ville),

    STRUCTURE_COURRIER_CODE_POSTAL: isDifferentAddress
      ? structure.adresseCourrier.codePostal
      : structure.codePostal,

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
    STATUT_DOM: USAGER_DECISION_STATUT_LABELS[usager.decision.statut],
    TYPE_DOM:
      "Type de domiciliation : première domiciliation ou renouvellement",

    // REFUS / RADIATION
    MOTIF_RADIATION: motif,
    DATE_RADIATION: moment(usager.decision.dateDecision)
      .locale("fr")
      .format("LL"),

    // DATES DOMICILIATION
    DATE_DEBUT_DOM: moment(dateDebutDom).locale("fr").format("LL"),
    DATE_FIN_DOM: moment(dateFinDom).locale("fr").format("LL"),

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

    // Transferts
    TRANSFERT_ACTIF: transfert.actif ? "OUI" : "NON",
    TRANSFERT_NOM: transfert.actif ? transfert.nom : "",
    TRANSFERT_ADRESSE: transfert.actif ? transfert.adresse : "",
    TRANSFERT_DATE_DEBUT:
      transfert.actif && transfert.dateDebut
        ? format(new Date(transfert.dateDebut), "dd/MM/yyyy")
        : "",
    TRANSFERT_DATE_FIN:
      transfert.actif && transfert.dateFin
        ? format(new Date(transfert.dateFin), "dd/MM/yyyy")
        : "",

    // Procuration
    PROCURATION_ACTIF: procuration.actif ? "OUI" : "NON",
    PROCURATION_NOM: procuration.actif ? procuration.nom : "",
    PROCURATION_PRENOM: procuration.actif ? procuration.prenom : "",
    PROCURATION_DATE_DEBUT:
      procuration.actif && procuration.dateDebut
        ? format(new Date(procuration.dateDebut), "dd/MM/yyyy")
        : "",
    PROCURATION_DATE_FIN:
      procuration.actif && procuration.dateFin
        ? format(new Date(procuration.dateFin), "dd/MM/yyyy")
        : "",
    PROCURATION_DATE_NAISSANCE:
      procuration.actif && procuration.dateNaissance
        ? format(new Date(procuration.dateNaissance), "dd/MM/yyyy")
        : "",

    ...extraParameters,
  };
}

const ucFirst = (value: string) => {
  return value === undefined || value === null
    ? ""
    : value.charAt(0).toUpperCase() + value.slice(1);
};

const notEmpty = (value: string): boolean => {
  return typeof value !== "undefined" && value !== null && value.trim() !== "";
};
