import { residence, typeMenage } from "../../stats/usagers.labels";
import { StructureCommon, UsagerLight } from "../../_common/model";
import { StructureCustomDocTags } from "../../_common/model/structure-doc/StructureCustomDocTags.type";
import { USAGER_DECISION_STATUT_LABELS } from "./../../_common/labels/USAGER_DECISION_STATUT_LABELS.const";
import { UsagerDecision } from "./../../_common/model/usager/UsagerDecision.type";
import { generateMotifLabel } from "./../services/generateMotifLabel.service";

export const DATE_FORMAT = {
  JOUR: "dd/MM/yyyy",
  JOUR_HEURE: "dd/MM/yyyy à HH:mm",
  JOUR_LONG: "PPP",
};

import { format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { fr } from "date-fns/locale";

export function buildCustomDoc({
  usager,
  structure,
  date,
  extraParameters = {},
}: {
  usager: UsagerLight;
  structure: StructureCommon;
  date: Date;
  extraParameters?: { [name: string]: string };
}): StructureCustomDocTags {
  // Date

  // On Repasse en UTC pour convertir correctement
  let dateOfDocument = zonedTimeToUtc(date, "Europe/Paris");
  // On repasse sur la bonne timezone

  dateOfDocument = utcToZonedTime(date, structure.timeZone);

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

  const transfert = usager.options.transfert;
  const procuration = usager.options.procurations[0] ?? {
    prenom: null,
    nom: null,
    dateDebut: null,
    dateFin: null,
    dateNaissance: null,
  };
  const orientation = usager.entretien.orientation
    ? usager.entretien.orientationDetail
      ? "Oui: " + usager.entretien.orientationDetail
      : "OUI"
    : "NON";
  const revenus = usager.entretien.revenus
    ? usager.entretien.revenusDetail
      ? "Oui: " + usager.entretien.revenusDetail
      : "OUI"
    : "NON";

  return {
    // DATES UTILES
    DATE_JOUR: format(dateOfDocument, DATE_FORMAT.JOUR),
    DATE_JOUR_HEURE: format(dateOfDocument, DATE_FORMAT.JOUR_HEURE),
    DATE_JOUR_LONG: format(dateOfDocument, DATE_FORMAT.JOUR_LONG, {
      locale: fr,
    }),

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
    USAGER_SURNOM: usager?.surnom ? ucFirst(usager?.surnom) : "",
    USAGER_DATE_NAISSANCE: format(usager.dateNaissance, DATE_FORMAT.JOUR),

    USAGER_LIEU_NAISSANCE: ucFirst(usager.villeNaissance),

    // CONTACT USAGER
    USAGER_PHONE: usager.phone || "",
    USAGER_EMAIL: usager.email || "",

    // STATUT ET TYPE DE DOM
    STATUT_DOM: USAGER_DECISION_STATUT_LABELS[usager.decision.statut],
    TYPE_DOM:
      usager.typeDom === "PREMIERE_DOM"
        ? "Première domiciliation"
        : "Renouvellement",

    // REFUS / RADIATION
    MOTIF_RADIATION: motif,
    DATE_RADIATION: format(
      new Date(usager.decision.dateDecision),
      DATE_FORMAT.JOUR_LONG,
      {
        locale: fr,
      }
    ),

    // DATES DOMICILIATION
    DATE_DEBUT_DOM: format(new Date(dateDebutDom), DATE_FORMAT.JOUR_LONG, {
      locale: fr,
    }),
    DATE_FIN_DOM: format(new Date(dateFinDom), DATE_FORMAT.JOUR_LONG, {
      locale: fr,
    }),
    DATE_PREMIERE_DOM: format(usager.datePremiereDom, DATE_FORMAT.JOUR_LONG, {
      locale: fr,
    }),

    DATE_DERNIER_PASSAGE: format(
      usager.lastInteraction.dateInteraction,
      DATE_FORMAT.JOUR_LONG,
      { locale: fr }
    ),

    // ENTRETIEN
    ENTRETIEN_CAUSE_INSTABILITE: "",
    ENTRETIEN_RAISON_DEMANDE: "",
    ENTRETIEN_ACCOMPAGNEMENT: "",

    ENTRETIEN_ORIENTE_PAR: orientation,

    ENTRETIEN_DOMICILIATION_EXISTANTE: usager.entretien.domiciliation
      ? "OUI"
      : "NON",

    ENTRETIEN_REVENUS: revenus,

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
        ? format(new Date(transfert.dateDebut), DATE_FORMAT.JOUR)
        : "",
    TRANSFERT_DATE_FIN:
      transfert.actif && transfert.dateFin
        ? format(new Date(transfert.dateFin), DATE_FORMAT.JOUR)
        : "",

    // Procuration
    PROCURATION_ACTIF: usager.options.procurations.length > 0 ? "OUI" : "NON",
    PROCURATION_NOM: procuration.nom ?? "",
    PROCURATION_PRENOM: procuration.prenom ?? "",
    PROCURATION_DATE_DEBUT: procuration.dateDebut
      ? format(new Date(procuration.dateDebut), DATE_FORMAT.JOUR)
      : "",
    PROCURATION_DATE_FIN: procuration.dateFin
      ? format(new Date(procuration.dateFin), DATE_FORMAT.JOUR)
      : "",
    PROCURATION_DATE_NAISSANCE: procuration.dateNaissance
      ? format(new Date(procuration.dateNaissance), DATE_FORMAT.JOUR)
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
