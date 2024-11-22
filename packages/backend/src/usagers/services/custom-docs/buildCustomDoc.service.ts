import { format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { fr } from "date-fns/locale";
import { getPhoneString } from "../../../util/phone/phoneUtils.service";
import { isNil } from "lodash";
import { getAyantsDroitsText } from "../cerfa";
import {
  USAGER_DECISION_STATUT_LABELS,
  ENTRETIEN_CAUSE_INSTABILITE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_TYPE_MENAGE,
  ENTRETIEN_RESIDENCE,
  UsagerDecision,
  generateMotifLabel,
  STRUCTURE_TYPE_LABELS,
  StructureCommon,
  ENTRETIEN_SITUATION_PRO,
  UsagerOptionsProcuration,
  TimeZone,
  Usager,
  ENTRETIEN_LIEN_COMMUNE,
} from "@domifa/common";
import { StructureCustomDocTags } from "../../../_common/model";
import { formatBoolean, ucFirst } from "../../../util";

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

  if (!isNil(structure.complementAdresse)) {
    adresseStructure =
      adresseStructure + ", " + ucFirst(structure.complementAdresse);
  }

  // Procu & transfert
  const transfert = usager.options.transfert;
  const procuration = usager.options.procurations[0] ?? {
    prenom: null,
    nom: null,
    dateDebut: null,
    dateFin: null,
    dateNaissance: null,
  };

  return {
    AYANTS_DROITS_NOMBRE: usager.ayantsDroits?.length?.toString() ?? "0",
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
    USAGER_CUSTOM_REF: usager?.customRef ?? usager.ref.toString(),
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
    USAGER_LANGUE: usager.langue ? ucFirst(usager?.langue) : "",
    USAGER_NATIONALITE: ucFirst(usager?.nationalite),
    DECISION_NOM_AGENT: ucFirst(usager?.decision?.userName),

    // CONTACT USAGER
    USAGER_PHONE: getPhoneString(usager.telephone),
    USAGER_EMAIL: usager.email || "",

    ...buildEntretienForDocs(usager),
    ...buildDecision(usager, structure, DATE_FORMAT.JOUR_LONG),

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

    PROCURATIONS_NOMBRE: usager.options.procurations.length,
    PROCURATIONS_LISTE: getProcurationsList(usager.options.procurations),
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

export const buildDecision = (
  usager: Pick<
    Usager,
    | "typeDom"
    | "decision"
    | "datePremiereDom"
    | "historique"
    | "lastInteraction"
  >,
  structure: StructureCommon,
  format = DATE_FORMAT.JOUR
) => {
  const motif = generateMotifLabel(usager.decision);
  const { dateDebutDom, dateFinDom, decisionUserPremierDom } =
    getDateDecision(usager);

  return {
    STATUT_DOM: USAGER_DECISION_STATUT_LABELS[usager.decision.statut],
    TYPE_DOM:
      usager.typeDom === "PREMIERE_DOM"
        ? "Première domiciliation"
        : "Renouvellement",

    // REFUS / RADIATION
    MOTIF_RADIATION: usager.decision.statut === "RADIE" ? motif : "",
    MOTIF_REFUS: usager.decision.statut === "REFUS" ? motif : "",
    DATE_RADIATION:
      usager.decision.statut === "RADIE"
        ? dateFormat(usager.decision.dateDebut, structure.timeZone, format)
        : "",
    DATE_REFUS:
      usager.decision.statut === "REFUS"
        ? dateFormat(usager.decision.dateDebut, structure.timeZone, format)
        : "",

    // DATES DOMICILIATION
    DATE_DEBUT_DOM: dateFormat(dateDebutDom, structure.timeZone, format),
    DATE_FIN_DOM: dateFormat(dateFinDom, structure.timeZone, format),
    PREMIERE_DOM_NOM_AGENT: decisionUserPremierDom ?? "",
    DATE_PREMIERE_DOM: dateFormat(
      usager.datePremiereDom,
      structure.timeZone,
      format
    ),

    DATE_DERNIER_PASSAGE: dateFormat(
      usager.lastInteraction.dateInteraction,
      structure.timeZone,
      format
    ),
  };
};

export const buildEntretienForDocs = (
  usager: Usager
): {
  ENTRETIEN_CAUSE_INSTABILITE: string;
  ENTRETIEN_RAISON_DEMANDE: string;
  ENTRETIEN_ACCOMPAGNEMENT: string;
  ENTRETIEN_ACCOMPAGNEMENT_DETAIL: string;
  ENTRETIEN_SITUATION_PROFESSIONNELLE: string;
  ENTRETIEN_ORIENTATION: string;
  ENTRETIEN_ORIENTATION_DETAIL: string;
  ENTRETIEN_RATTACHEMENT: string;
  ENTRETIEN_DOMICILIATION_EXISTANTE: string;
  ENTRETIEN_REVENUS: string;
  ENTRETIEN_REVENUS_DETAIL: string;
  ENTRETIEN_LIEN_COMMUNE: string;
  ENTRETIEN_COMPOSITION_MENAGE: string;
  ENTRETIEN_COMMENTAIRE: string;
  ENTRETIEN_SITUATION_RESIDENTIELLE: string;
} => {
  return {
    ENTRETIEN_CAUSE_INSTABILITE: usager.entretien.cause
      ? ENTRETIEN_CAUSE_INSTABILITE[usager.entretien.cause]
      : "",
    ENTRETIEN_RAISON_DEMANDE: usager.entretien.raison
      ? usager.entretien.raison === "AUTRE"
        ? "Autre: " + ucFirst(usager.entretien.raisonDetail)
        : ENTRETIEN_RAISON_DEMANDE[usager.entretien.raison]
      : "",
    ENTRETIEN_ACCOMPAGNEMENT: formatBoolean(usager.entretien.accompagnement),
    ENTRETIEN_ACCOMPAGNEMENT_DETAIL: usager.entretien.accompagnement
      ? ucFirst(usager.entretien.accompagnementDetail)
      : "",
    ENTRETIEN_SITUATION_PROFESSIONNELLE:
      usager.entretien.situationPro === "AUTRE"
        ? "Autre : " + ucFirst(usager.entretien.situationProDetail)
        : usager.entretien.situationPro
        ? ENTRETIEN_SITUATION_PRO[usager.entretien.situationPro]
        : "",
    ENTRETIEN_ORIENTATION: formatBoolean(usager.entretien.orientation),
    ENTRETIEN_ORIENTATION_DETAIL: ucFirst(
      usager.entretien.accompagnementDetail
    ),
    ENTRETIEN_RATTACHEMENT: ucFirst(usager.entretien.rattachement),

    ENTRETIEN_DOMICILIATION_EXISTANTE: formatBoolean(
      usager.entretien.domiciliation
    ),
    ENTRETIEN_REVENUS: formatBoolean(usager.entretien.revenus),
    ENTRETIEN_REVENUS_DETAIL: ucFirst(usager.entretien.revenusDetail),
    ENTRETIEN_LIEN_COMMUNE:
      usager.entretien.liencommune === "AUTRE"
        ? "Autre: " + ucFirst(usager.entretien.liencommune)
        : usager.entretien.liencommuneDetail
        ? ENTRETIEN_LIEN_COMMUNE[usager.entretien.liencommune]
        : "",
    ENTRETIEN_COMPOSITION_MENAGE: usager.entretien.typeMenage
      ? ENTRETIEN_TYPE_MENAGE[usager.entretien.typeMenage]
      : "",
    ENTRETIEN_COMMENTAIRE: usager.entretien.commentaires ?? "",
    ENTRETIEN_SITUATION_RESIDENTIELLE:
      usager.entretien.residence === "AUTRE"
        ? `Autre: ${ucFirst(usager.entretien.residenceDetail)}`
        : usager.entretien.residence
        ? ENTRETIEN_RESIDENCE[usager.entretien.residence]
        : "",
  };
};

export const dateFormat = (
  date: Date | string,
  timeZone: TimeZone,
  displayFormat: string
): string => {
  if (!date || date === "") {
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

export const getDateDecision = (
  usager: Pick<Usager, "decision" | "historique" | "datePremiereDom">
): {
  dateDebutDom: Date | null;
  dateFinDom: Date | null;
  decisionUserPremierDom: string;
} => {
  let decisionUserPremierDom = "";

  const valideDecisions = usager.historique.filter(
    (decision: UsagerDecision) => decision.statut === "VALIDE"
  );

  decisionUserPremierDom = valideDecisions[0]?.userName ?? "";

  if (usager.decision.statut === "VALIDE") {
    return {
      dateDebutDom: usager.decision.dateDebut,
      dateFinDom: usager.decision.dateFin,
      decisionUserPremierDom,
    };
  }

  if (valideDecisions.length >= 1) {
    const valideDecision = valideDecisions[valideDecisions.length - 1];

    return {
      dateDebutDom: valideDecision.dateDebut,
      dateFinDom: valideDecision.dateFin,
      decisionUserPremierDom,
    };
  }

  return {
    dateDebutDom: null,
    dateFinDom: null,
    decisionUserPremierDom: null,
  };
};

export function getProcurationsList(procurations: UsagerOptionsProcuration[]) {
  let procurationString = "";
  if (procurations.length > 0) {
    procurationString = procurations.reduce(
      (prev: string, current: UsagerOptionsProcuration) => {
        const dateNaissance = dateFormat(
          current.dateNaissance,
          "Europe/Paris",
          DATE_FORMAT.JOUR
        );
        const dateDebut = dateFormat(
          current.dateDebut,
          "Europe/Paris",
          DATE_FORMAT.JOUR
        );
        const dateFin = dateFormat(
          current.dateFin,
          "Europe/Paris",
          DATE_FORMAT.JOUR
        );
        return `${prev}\n${current.nom} ${current.prenom} né(e) le ${dateNaissance} - Du ${dateDebut} au ${dateFin}`;
      },
      ""
    );
  }
  return procurationString.trim();
}
