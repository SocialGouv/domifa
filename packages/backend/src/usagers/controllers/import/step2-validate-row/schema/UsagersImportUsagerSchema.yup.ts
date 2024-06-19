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
  ENTRETIEN_SITUATION_PRO,
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
    customRef: yup.string().max(50),
    civilite: oneOfString(["H", "F"]).required(),
    nom: yup.string().max(200).required(),
    prenom: yup.string().max(200).required(),
    surnom: yup.string().max(100),
    dateNaissance: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$today"))
      .required(),
    lieuNaissance: yup.string().required().max(1000),
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
      .required()
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
    orientationDetail: yup.string().max(1000),
    domiciliationExistante: booleanOuiNon().notRequired(),
    situationPro: oneOfString(
      Object.keys(ENTRETIEN_SITUATION_PRO)
    ).notRequired(),
    situationProDetail: yup.string().notRequired().max(1000),
    revenus: booleanOuiNon().notRequired(),
    revenusDetail: yup.string().max(1000),
    liencommune: oneOfString(Object.keys(ENTRETIEN_LIEN_COMMUNE)).notRequired(),
    liencommuneDetail: yup.string().max(1000),
    typeMenage: oneOfString(Object.keys(ENTRETIEN_TYPE_MENAGE)).notRequired(),
    residence: oneOfString(Object.keys(ENTRETIEN_RESIDENCE)).notRequired(),
    residenceDetail: yup.string().notRequired().max(1000),
    causeInstabilite: oneOfString(
      Object.keys(ENTRETIEN_CAUSE_INSTABILITE)
    ).notRequired(),
    causeDetail: yup.string().notRequired().max(1000),
    raisonDemande: oneOfString(
      Object.keys(ENTRETIEN_RAISON_DEMANDE)
    ).notRequired(),
    raisonDemandeDetail: yup.string().max(1000),
    accompagnement: booleanOuiNon().notRequired(),
    accompagnementDetail: yup.string().max(1000),
    commentaires: yup.string().max(2000),
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
