import { STRUCTURE_TYPE_LABELS } from "../../../_common/model/structure/constants/STRUCTURE_TYPE_LABELS.const";

import { StructureCommon, Usager } from "../../../_common/model";
import { StructureCustomDocTags } from "../../../_common/model/structure-doc/StructureCustomDocTags.type";
import { UsagerDecision } from "../../../_common/model/usager/UsagerDecision.type";
import { generateMotifLabel } from "../generateMotifLabel.service";

import { format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { fr } from "date-fns/locale";
import { TimeZone } from "../../../util/territoires";
import { getPhoneString } from "../../../util/phone/phoneUtils.service";
import { getAyantsDroitsText } from "../cerfa";
import {
  USAGER_DECISION_STATUT_LABELS,
  ENTRETIEN_CAUSE_INSTABILITE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_TYPE_MENAGE,
  ENTRETIEN_RESIDENCE,
} from "@domifa/common";

export const DATE_FORMAT = {
  JOUR: "dd/MM/yyyy",
  JOUR_HEURE: "dd/MM/yyyy à HH:mm",
  JOUR_LONG: "PPP",
};

export function buildCustomDoc({
  usager,
  structure,
  date,
  extraParameters = {},
}: {
  usager: Usager;
  structure: StructureCommon;
  date: Date;
  extraParameters?: { [name: string]: string };
}): StructureCustomDocTags {
  // Adresse courrier active
  const isDifferentAddress = structure.adresseCourrier?.actif;
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
    AYANTS_DROITS_LISTE: getAyantsDroitsText(usager),
    // DATES UTILES
    DATE_JOUR: dateFormat(date, structure.timeZone, DATE_FORMAT.JOUR),
    DATE_JOUR_HEURE: dateFormat(
      date,
      structure.timeZone,
      DATE_FORMAT.JOUR_HEURE
    ),
    DATE_JOUR_LONG: dateFormat(date, structure.timeZone, DATE_FORMAT.JOUR_LONG),

    // INFOS RESPONSABLE
    RESPONSABLE_NOM: ucFirst(structure.responsable.nom),
    RESPONSABLE_PRENOM: ucFirst(structure.responsable.prenom),
    RESPONSABLE_FONCTION: structure.responsable.fonction,

    // INFOS STRUCTURE
    STRUCTURE_NOM: ucFirst(structure.nom),
    STRUCTURE_TYPE: STRUCTURE_TYPE_LABELS[structure.structureType],
    STRUCTURE_ADRESSE: adresseStructure,
    STRUCTURE_ADRESSE_EMAIL: structure.email,

    STRUCTURE_VILLE: ucFirst(structure.ville),
    STRUCTURE_CODE_POSTAL: structure.codePostal,

    // ADRESSE COURRIER
    STRUCTURE_COURRIER_ADRESSE: isDifferentAddress
      ? ucFirst(structure.adresseCourrier.adresse)
      : adresseStructure,
    STRUCTURE_COMPLEMENT_ADRESSE: isDifferentAddress
      ? ""
      : ucFirst(structure.complementAdresse),

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
    USAGER_NUMERO_DISTRIBUTION_SPECIALE: usager.numeroDistribution
      ? usager.numeroDistribution
      : "",
    USAGER_SURNOM: usager?.surnom ? ucFirst(usager?.surnom) : "",
    USAGER_DATE_NAISSANCE: dateFormat(
      usager.dateNaissance,
      structure.timeZone,
      DATE_FORMAT.JOUR
    ),

    USAGER_LIEU_NAISSANCE: ucFirst(usager.villeNaissance),

    // CONTACT USAGER
    USAGER_PHONE: getPhoneString(usager.telephone),
    USAGER_EMAIL: usager.email || "",

    // STATUT ET TYPE DE DOM
    STATUT_DOM: USAGER_DECISION_STATUT_LABELS[usager.decision.statut],
    TYPE_DOM:
      usager.typeDom === "PREMIERE_DOM"
        ? "Première domiciliation"
        : "Renouvellement",

    // REFUS / RADIATION
    MOTIF_RADIATION: motif,
    DATE_RADIATION:
      usager.decision.statut === "RADIE"
        ? dateFormat(
            usager.decision.dateDecision,
            structure.timeZone,
            DATE_FORMAT.JOUR_LONG
          )
        : "",

    // DATES DOMICILIATION
    DATE_DEBUT_DOM: dateFormat(
      dateDebutDom,
      structure.timeZone,
      DATE_FORMAT.JOUR_LONG
    ),
    DATE_FIN_DOM: dateFormat(
      dateFinDom,
      structure.timeZone,
      DATE_FORMAT.JOUR_LONG
    ),
    DATE_PREMIERE_DOM: dateFormat(
      usager.datePremiereDom,
      structure.timeZone,
      DATE_FORMAT.JOUR_LONG
    ),

    DATE_DERNIER_PASSAGE: dateFormat(
      usager.lastInteraction.dateInteraction,
      structure.timeZone,
      DATE_FORMAT.JOUR_LONG
    ),

    // ENTRETIEN
    ENTRETIEN_CAUSE_INSTABILITE: usager.entretien.cause
      ? ENTRETIEN_CAUSE_INSTABILITE[usager.entretien.cause]
      : "",
    ENTRETIEN_RAISON_DEMANDE: usager.entretien.raison
      ? ENTRETIEN_RAISON_DEMANDE[usager.entretien.raison]
      : "",

    ENTRETIEN_ACCOMPAGNEMENT: usager.entretien.accompagnement ? "OUI" : "NON",

    ENTRETIEN_ORIENTE_PAR: orientation,
    ENTRETIEN_RATTACHEMENT: usager.entretien.rattachement
      ? usager.entretien.rattachement
      : "",

    ENTRETIEN_DOMICILIATION_EXISTANTE: usager.entretien.domiciliation
      ? "OUI"
      : "NON",

    ENTRETIEN_REVENUS: revenus,

    ENTRETIEN_LIEN_COMMUNE: usager.entretien.liencommune || "",

    ENTRETIEN_COMPOSITION_MENAGE: usager.entretien.typeMenage
      ? ENTRETIEN_TYPE_MENAGE[usager.entretien.typeMenage]
      : "",

    ENTRETIEN_SITUATION_RESIDENTIELLE:
      usager.entretien.residence === "AUTRE"
        ? " Autre : " + usager.entretien.residenceDetail
        : usager.entretien.residence
        ? ENTRETIEN_RESIDENCE[usager.entretien.residence]
        : "",

    // Transferts
    TRANSFERT_ACTIF: transfert.actif ? "OUI" : "NON",
    TRANSFERT_NOM: transfert.actif ? transfert.nom : "",
    TRANSFERT_ADRESSE: transfert.actif ? transfert.adresse : "",
    TRANSFERT_DATE_DEBUT:
      transfert.actif && transfert.dateDebut
        ? dateFormat(transfert.dateDebut, structure.timeZone, DATE_FORMAT.JOUR)
        : "",
    TRANSFERT_DATE_FIN:
      transfert.actif && transfert.dateFin
        ? dateFormat(transfert.dateFin, structure.timeZone, DATE_FORMAT.JOUR)
        : "",

    // Procuration
    PROCURATION_ACTIF: usager.options.procurations.length > 0 ? "OUI" : "NON",
    PROCURATION_NOM: procuration.nom ?? "",
    PROCURATION_PRENOM: procuration.prenom ?? "",
    PROCURATION_DATE_DEBUT: procuration.dateDebut
      ? dateFormat(procuration.dateDebut, structure.timeZone, DATE_FORMAT.JOUR)
      : "",
    PROCURATION_DATE_FIN: procuration.dateFin
      ? dateFormat(procuration.dateFin, structure.timeZone, DATE_FORMAT.JOUR)
      : "",
    PROCURATION_DATE_NAISSANCE: procuration.dateNaissance
      ? dateFormat(
          procuration.dateNaissance,
          structure.timeZone,
          DATE_FORMAT.JOUR
        )
      : "",

    ...extraParameters,
  };
}

export const ucFirst = (value: string) => {
  return value === undefined || value === null
    ? ""
    : value.charAt(0).toUpperCase() + value.slice(1);
};

export const notEmpty = (value: string): boolean => {
  return typeof value !== "undefined" && value !== null && value.trim() !== "";
};

export const dateFormat = (
  date: Date | string,
  timeZone: TimeZone,
  displayFormat: string
): string => {
  if (date === "" || date === null) {
    return "";
  }

  if (typeof date === "string") {
    date = new Date(date);
  }
  // On Repasse en UTC pour convertir correctement
  date = zonedTimeToUtc(date, "Europe/Paris");
  // On repasse sur la bonne timezone
  date = utcToZonedTime(date, timeZone);

  return format(date, displayFormat, {
    locale: fr,
  });
};
