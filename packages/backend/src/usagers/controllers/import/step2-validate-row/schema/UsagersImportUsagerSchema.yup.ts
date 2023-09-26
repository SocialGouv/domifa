import * as yup from "yup";
import {
  ENTRETIEN_TYPE_MENAGE,
  ENTRETIEN_CAUSE_INSTABILITE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RESIDENCE,
  LIEN_PARENTE_LABELS,
  MOTIFS_RADIATION_LABELS_MAP,
  MOTIFS_REFUS_LABELS_MAP,
  UsagerDecisionStatut,
} from "@domifa/common";

import {
  booleanOuiNon,
  dateUtcSchema,
  oneOfString,
  phone,
  typeDomSchema,
} from "./core";
import { email } from "./core/email.yup";

// Note: les méthodes .notRequired() et .required() sont indispensable pour que `oneOfString` soit correctement typé
export const UsagersImportUsagerSchema = yup
  .object({
    customRef: yup.string(),
    civilite: oneOfString(["H", "F"]).required(),
    nom: yup.string().required(),
    prenom: yup.string().required(),
    surnom: yup.string(),
    dateNaissance: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$today"))
      .required(),
    lieuNaissance: yup.string().required(),
    telephone: phone(),
    email: email().notRequired(),
    statutDom: oneOfString(["VALIDE", "REFUS", "RADIE"]).required(),
    motifRefus: oneOfString(MOTIFS_REFUS_LABELS_MAP).notRequired(),
    motifRadiation: oneOfString(MOTIFS_RADIATION_LABELS_MAP).notRequired(),
    typeDom: typeDomSchema.required(),
    dateDebutDom: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$nextYear"))
      .when("statutDom", {
        is: (statutDom: UsagerDecisionStatut) => statutDom === "VALIDE",
        then: dateUtcSchema().required(),
      }),
    dateFinDom: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$nextYear"))
      .when("statutDom", {
        is: (statutDom: UsagerDecisionStatut) => statutDom === "VALIDE",
        then: dateUtcSchema()
          .min(yup.ref("dateDebutDom"))
          .max(yup.ref("$nextYear"))
          .required(),
      }),
    datePremiereDom: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$today"))
      .notRequired(),
    dateDernierPassage: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$today"))
      .notRequired(),
    // ENTRETIEN
    orientation: booleanOuiNon().notRequired(),
    orientationDetail: yup.string(),
    domiciliationExistante: booleanOuiNon().notRequired(),
    revenus: booleanOuiNon().notRequired(),
    revenusDetail: yup.string(),
    liencommune: oneOfString(Object.keys(ENTRETIEN_LIEN_COMMUNE)).notRequired(),
    liencommuneDetail: yup.string(),
    typeMenage: oneOfString(Object.keys(ENTRETIEN_TYPE_MENAGE)).notRequired(),
    situationResidentielle: oneOfString(
      Object.keys(ENTRETIEN_RESIDENCE)
    ).notRequired(),
    situationDetails: yup.string(),
    causeInstabilite: oneOfString(
      Object.keys(ENTRETIEN_CAUSE_INSTABILITE)
    ).notRequired(),
    causeDetail: yup.string(),
    raisonDemande: oneOfString(
      Object.keys(ENTRETIEN_RAISON_DEMANDE)
    ).notRequired(),
    raisonDemandeDetail: yup.string(),
    accompagnement: booleanOuiNon().notRequired(),
    accompagnementDetail: yup.string(),
    commentaires: yup.string(),
    ayantsDroits: yup
      .array(
        yup.object({
          nom: yup.string().required(),
          prenom: yup.string().required(),
          dateNaissance: dateUtcSchema()
            .min(yup.ref("$minDate"))
            .max(yup.ref("$today"))
            .required(),
          lienParente: oneOfString(Object.keys(LIEN_PARENTE_LABELS)).required(),
        })
      )
      .default([]),
  })
  .label("UsagersImportUsager");

export type UsagersImportUsager = yup.TypeOf<typeof UsagersImportUsagerSchema>;
