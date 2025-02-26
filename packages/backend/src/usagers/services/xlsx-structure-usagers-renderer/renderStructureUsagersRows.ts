import {
  StructureCommon,
  UsagerAyantDroit,
  UserStructureProfile,
} from "@domifa/common";

import set from "lodash.set";
import {
  StructureCustomDocTags,
  CUSTOM_DOCS_LABELS,
} from "../../../_common/model";
import { buildCustomDoc, buildDecision, DATE_FORMAT } from "../custom-docs";
import { StructureUsagerExport } from "./StructureUsagerExport.type";
import { format } from "date-fns";
import { dateFormat } from "../../../util";

export const renderStructureUsagersHeaders = (
  structure: StructureCommon
): {
  firstSheetHeaders: StructureCustomDocTags[];
  secondSheetHeaders: StructureCustomDocTags[];
} => {
  const dateHeader = dateFormat(
    new Date(),
    structure.timeZone,
    DATE_FORMAT.JOUR_HEURE
  );

  const usagersListHeader: StructureCustomDocTags = {
    USAGER_CUSTOM_REF: CUSTOM_DOCS_LABELS.USAGER_CUSTOM_REF,
    USAGER_CIVILITE: CUSTOM_DOCS_LABELS.USAGER_CIVILITE,
    USAGER_NOM: CUSTOM_DOCS_LABELS.USAGER_NOM,
    USAGER_PRENOM: CUSTOM_DOCS_LABELS.USAGER_PRENOM,
    USAGER_SURNOM: CUSTOM_DOCS_LABELS.USAGER_SURNOM,
    USAGER_DATE_NAISSANCE: CUSTOM_DOCS_LABELS.USAGER_DATE_NAISSANCE,
    USAGER_LIEU_NAISSANCE: CUSTOM_DOCS_LABELS.USAGER_LIEU_NAISSANCE,
    USAGER_PHONE: CUSTOM_DOCS_LABELS.USAGER_PHONE,
    USAGER_EMAIL: CUSTOM_DOCS_LABELS.USAGER_EMAIL,
    USAGER_LANGUE: CUSTOM_DOCS_LABELS.USAGER_LANGUE,
    USAGER_NATIONALITE: CUSTOM_DOCS_LABELS.USAGER_NATIONALITE,
    USAGER_NUMERO_DISTRIBUTION_SPECIALE:
      CUSTOM_DOCS_LABELS.USAGER_NUMERO_DISTRIBUTION_SPECIALE,
    STATUT_DOM: CUSTOM_DOCS_LABELS.STATUT_DOM,
    DATE_RADIATION: CUSTOM_DOCS_LABELS.DATE_RADIATION,
    MOTIF_RADIATION: CUSTOM_DOCS_LABELS.MOTIF_RADIATION,
    DATE_REFUS: CUSTOM_DOCS_LABELS.DATE_REFUS,
    MOTIF_REFUS: CUSTOM_DOCS_LABELS.MOTIF_REFUS,
    DECISION_NOM_AGENT: CUSTOM_DOCS_LABELS.DECISION_NOM_AGENT,
    PREMIERE_DOM_NOM_AGENT: CUSTOM_DOCS_LABELS.PREMIERE_DOM_NOM_AGENT,
    TYPE_DOM: CUSTOM_DOCS_LABELS.TYPE_DOM,
    DATE_DEBUT_DOM: CUSTOM_DOCS_LABELS.DATE_DEBUT_DOM,
    DATE_FIN_DOM: CUSTOM_DOCS_LABELS.DATE_FIN_DOM,
    DATE_PREMIERE_DOM: CUSTOM_DOCS_LABELS.DATE_PREMIERE_DOM,
    DATE_DERNIER_PASSAGE: CUSTOM_DOCS_LABELS.DATE_DERNIER_PASSAGE,
    //  REFERENT: CUSTOM_DOCS_LABELS.REFERENT,
    AYANTS_DROITS_NOMBRE: CUSTOM_DOCS_LABELS.AYANTS_DROITS_NOMBRE,
    TRANSFERT_ACTIF: CUSTOM_DOCS_LABELS.TRANSFERT_ACTIF,
    TRANSFERT_NOM: CUSTOM_DOCS_LABELS.TRANSFERT_NOM,
    TRANSFERT_ADRESSE: CUSTOM_DOCS_LABELS.TRANSFERT_ADRESSE,
    TRANSFERT_DATE_DEBUT: CUSTOM_DOCS_LABELS.TRANSFERT_DATE_DEBUT,
    TRANSFERT_DATE_FIN: CUSTOM_DOCS_LABELS.TRANSFERT_DATE_FIN,
    PROCURATION_ACTIF: CUSTOM_DOCS_LABELS.PROCURATION_ACTIF,
    PROCURATIONS_NOMBRE: CUSTOM_DOCS_LABELS.PROCURATIONS_NOMBRE,
    MON_DOMIFA_ACTIVATION: CUSTOM_DOCS_LABELS.MON_DOMIFA_ACTIVATION,
    SMS_ACTIVATION: CUSTOM_DOCS_LABELS.SMS_ACTIVATION,
  };

  const entretiensHeader: StructureCustomDocTags = {
    USAGER_CUSTOM_REF: CUSTOM_DOCS_LABELS.USAGER_CUSTOM_REF,
    USAGER_CIVILITE: CUSTOM_DOCS_LABELS.USAGER_CIVILITE,
    USAGER_NOM: CUSTOM_DOCS_LABELS.USAGER_NOM,
    USAGER_PRENOM: CUSTOM_DOCS_LABELS.USAGER_PRENOM,
    USAGER_SURNOM: CUSTOM_DOCS_LABELS.USAGER_SURNOM,
    USAGER_DATE_NAISSANCE: CUSTOM_DOCS_LABELS.USAGER_DATE_NAISSANCE,
    ENTRETIEN_ORIENTATION: CUSTOM_DOCS_LABELS.ENTRETIEN_ORIENTATION,
    ENTRETIEN_ORIENTATION_DETAIL:
      CUSTOM_DOCS_LABELS.ENTRETIEN_ORIENTATION_DETAIL,
    ENTRETIEN_DOMICILIATION_EXISTANTE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_DOMICILIATION_EXISTANTE,
    ENTRETIEN_SITUATION_PROFESSIONNELLE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_SITUATION_PROFESSIONNELLE,
    ENTRETIEN_REVENUS: CUSTOM_DOCS_LABELS.ENTRETIEN_REVENUS,
    ENTRETIEN_REVENUS_DETAIL: CUSTOM_DOCS_LABELS.ENTRETIEN_REVENUS_DETAIL,
    ENTRETIEN_LIEN_COMMUNE: CUSTOM_DOCS_LABELS.ENTRETIEN_LIEN_COMMUNE,
    ENTRETIEN_COMPOSITION_MENAGE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_COMPOSITION_MENAGE,
    ENTRETIEN_SITUATION_RESIDENTIELLE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_SITUATION_RESIDENTIELLE,
    ENTRETIEN_CAUSE_INSTABILITE: CUSTOM_DOCS_LABELS.ENTRETIEN_CAUSE_INSTABILITE,
    ENTRETIEN_RAISON_DEMANDE: CUSTOM_DOCS_LABELS.ENTRETIEN_RAISON_DEMANDE,
    ENTRETIEN_ACCOMPAGNEMENT: CUSTOM_DOCS_LABELS.ENTRETIEN_ACCOMPAGNEMENT,
    ENTRETIEN_ACCOMPAGNEMENT_DETAIL:
      CUSTOM_DOCS_LABELS.ENTRETIEN_ACCOMPAGNEMENT_DETAIL,
    ENTRETIEN_RATTACHEMENT: CUSTOM_DOCS_LABELS.ENTRETIEN_RATTACHEMENT,

    ENTRETIEN_COMMENTAIRE: CUSTOM_DOCS_LABELS.ENTRETIEN_COMMENTAIRE,
  };

  const firstSheetHeaders = [
    { USAGER_CUSTOM_REF: dateHeader },
    usagersListHeader,
  ];

  const secondSheetHeaders = [
    { USAGER_CUSTOM_REF: dateHeader },
    entretiensHeader,
  ];

  for (let index = 0; index < 8; index++) {
    set(usagersListHeader, `AD_NOM_${index}`, `Nom ayant-droit ${index + 1}`);
    set(
      usagersListHeader,
      `AD_PRENOM_${index}`,
      `Prénom ayant-droit ${index + 1}`
    );
    set(
      usagersListHeader,
      `AD_DATE_NAISSANCE_${index}`,
      `Date naissance ayant-droit ${index + 1}`
    );
    set(usagersListHeader, `AD_LIEN_${index}`, `Lien de parenté ${index + 1}`);
  }

  return {
    firstSheetHeaders,
    secondSheetHeaders,
  };
};

export const renderStructureUsagersRows = (
  usagers: StructureUsagerExport[],
  structure: StructureCommon,
  users: Pick<UserStructureProfile, "id" | "nom" | "prenom">[]
): {
  firstSheetUsagers: StructureCustomDocTags[];
  secondSheetEntretiens: StructureCustomDocTags[];
} => {
  const firstSheetUsagers = [];
  const secondSheetEntretiens = [];

  for (const usagerToExport of usagers) {
    try {
      const firstPartOfData = buildCustomDoc({
        usager: {
          ...usagerToExport,
          structureId: structure.id,
          contactByPhone: null,
          etapeDemande: null,
          statut: usagerToExport.decision.statut,
          rdv: null,
          pinnedNote: null,
        },
        structure,
        date: new Date(),
        extraParameters: null,
        users,
      });
      const customData = {
        ...firstPartOfData,
        ...buildDecision(usagerToExport, structure, DATE_FORMAT.JOUR),
      };

      const usager = renderFirstSheetData(customData);
      const entretien = renderSecondSheetData(customData);

      let index = 0;

      usagerToExport.ayantsDroits.forEach((ad: UsagerAyantDroit) => {
        set(usager, `AD_NOM_${index}`, ad.nom);
        set(usager, `AD_PRENOM_${index}`, ad.prenom);
        set(
          usager,
          `AD_DATE_NAISSANCE_${index}`,
          format(new Date(ad.dateNaissance), DATE_FORMAT.JOUR)
        );
        set(usager, `AD_LIEN_${index}`, ad.lien);
        index++;
      });

      firstSheetUsagers.push(usager);
      secondSheetEntretiens.push(entretien);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    firstSheetUsagers,
    secondSheetEntretiens,
  };
};

export const renderFirstSheetData = (
  usager: StructureCustomDocTags
): StructureCustomDocTags => {
  return {
    USAGER_CUSTOM_REF: usager.USAGER_CUSTOM_REF ?? usager.USAGER_REF,
    USAGER_CIVILITE: usager.USAGER_CIVILITE,
    USAGER_NOM: usager.USAGER_NOM,
    USAGER_PRENOM: usager.USAGER_PRENOM,
    USAGER_SURNOM: usager.USAGER_SURNOM,
    USAGER_DATE_NAISSANCE: usager.USAGER_DATE_NAISSANCE,
    USAGER_LIEU_NAISSANCE: usager.USAGER_LIEU_NAISSANCE,
    USAGER_PHONE: usager.USAGER_PHONE,
    USAGER_EMAIL: usager.USAGER_EMAIL,
    USAGER_LANGUE: usager.USAGER_LANGUE,
    USAGER_NATIONALITE: usager.USAGER_NATIONALITE,
    USAGER_NUMERO_DISTRIBUTION_SPECIALE:
      usager.USAGER_NUMERO_DISTRIBUTION_SPECIALE,
    STATUT_DOM: usager.STATUT_DOM,
    DATE_RADIATION: usager.DATE_RADIATION,
    MOTIF_RADIATION: usager.MOTIF_RADIATION,
    DATE_REFUS: usager.DATE_REFUS,
    MOTIF_REFUS: usager.MOTIF_REFUS,
    DECISION_NOM_AGENT: usager.DECISION_NOM_AGENT,
    PREMIERE_DOM_NOM_AGENT: usager.PREMIERE_DOM_NOM_AGENT,
    TYPE_DOM: usager.TYPE_DOM,
    DATE_DEBUT_DOM: usager.DATE_DEBUT_DOM,
    DATE_FIN_DOM: usager.DATE_FIN_DOM,
    DATE_PREMIERE_DOM: usager.DATE_PREMIERE_DOM,
    DATE_DERNIER_PASSAGE: usager.DATE_DERNIER_PASSAGE,
    // REFERENT: usager.REFERENT,
    AYANTS_DROITS_NOMBRE: usager.AYANTS_DROITS_NOMBRE,
    TRANSFERT_ACTIF: usager.TRANSFERT_ACTIF,
    TRANSFERT_NOM: usager.TRANSFERT_NOM,
    TRANSFERT_ADRESSE: usager.TRANSFERT_ADRESSE,
    TRANSFERT_DATE_DEBUT: usager.TRANSFERT_DATE_DEBUT,
    TRANSFERT_DATE_FIN: usager.TRANSFERT_DATE_FIN,
    PROCURATION_ACTIF: usager.PROCURATION_ACTIF,
    PROCURATIONS_NOMBRE: usager.PROCURATIONS_NOMBRE,
    MON_DOMIFA_ACTIVATION: usager.MON_DOMIFA_ACTIVATION,
    SMS_ACTIVATION: usager.SMS_ACTIVATION,
  };
};

export const renderSecondSheetData = (
  usager: StructureCustomDocTags
): StructureCustomDocTags => {
  return {
    USAGER_CUSTOM_REF: usager.USAGER_CUSTOM_REF,
    USAGER_CIVILITE: usager.USAGER_CIVILITE,
    USAGER_NOM: usager.USAGER_NOM,
    USAGER_PRENOM: usager.USAGER_PRENOM,
    USAGER_SURNOM: usager.USAGER_SURNOM,
    USAGER_DATE_NAISSANCE: usager.USAGER_DATE_NAISSANCE,
    ENTRETIEN_ORIENTATION: usager.ENTRETIEN_ORIENTATION,
    ENTRETIEN_ORIENTATION_DETAIL: usager.ENTRETIEN_ORIENTATION_DETAIL,
    ENTRETIEN_DOMICILIATION_EXISTANTE: usager.ENTRETIEN_DOMICILIATION_EXISTANTE,
    ENTRETIEN_SITUATION_PROFESSIONNELLE:
      usager.ENTRETIEN_SITUATION_PROFESSIONNELLE,
    ENTRETIEN_REVENUS: usager.ENTRETIEN_REVENUS,
    ENTRETIEN_REVENUS_DETAIL: usager.ENTRETIEN_REVENUS_DETAIL,
    ENTRETIEN_LIEN_COMMUNE: usager.ENTRETIEN_LIEN_COMMUNE,
    ENTRETIEN_COMPOSITION_MENAGE: usager.ENTRETIEN_COMPOSITION_MENAGE,
    ENTRETIEN_SITUATION_RESIDENTIELLE: usager.ENTRETIEN_SITUATION_RESIDENTIELLE,
    ENTRETIEN_CAUSE_INSTABILITE: usager.ENTRETIEN_CAUSE_INSTABILITE,
    ENTRETIEN_RAISON_DEMANDE: usager.ENTRETIEN_RAISON_DEMANDE,
    ENTRETIEN_ACCOMPAGNEMENT: usager.ENTRETIEN_ACCOMPAGNEMENT,
    ENTRETIEN_ACCOMPAGNEMENT_DETAIL: usager.ENTRETIEN_ACCOMPAGNEMENT_DETAIL,
    ENTRETIEN_RATTACHEMENT: usager.ENTRETIEN_RATTACHEMENT,
    ENTRETIEN_COMMENTAIRE: usager.ENTRETIEN_COMMENTAIRE,
  };
};
