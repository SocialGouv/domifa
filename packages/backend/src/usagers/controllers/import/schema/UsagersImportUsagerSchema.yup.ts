import * as yup from "yup";
import { TypeOf } from "yup";
import { booleanOuiNon, dateUtcSchema, oneOfString, phone } from "./core";
import { email } from "./core/email.yup";

// Note: les méthodes .notRequired() et .required() sont indispensable pour que `oneOfString` soit correctement typé
export const UsagersImportUsagerSchema = yup
  .object({
    customId: yup.string(),
    civilite: oneOfString(["H", "F"]).required(),
    nom: yup.string().required(),
    prenom: yup.string().required(),
    surnom: yup.string(),
    dateNaissance: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$today"))
      .required(),
    lieuNaissance: yup.string().required(),
    phone: phone(),
    email: email(),
    statutDom: oneOfString(["VALIDE", "REFUS", "RADIE"]).notRequired(),
    motifRefus: oneOfString([
      "LIEN_COMMUNE",
      "SATURATION",
      "HORS_AGREMENT",
      "AUTRE",
    ]).notRequired(),
    motifRadiation: oneOfString([
      "NON_MANIFESTATION_3_MOIS",
      "A_SA_DEMANDE",
      "ENTREE_LOGEMENT",
      "FIN_DE_DOMICILIATION",
      "PLUS_DE_LIEN_COMMUNE",
      "NON_RESPECT_REGLEMENT",
      "AUTRE",
    ]).notRequired(),
    typeDom: oneOfString(["PREMIERE", "RENOUVELLEMENT"]).notRequired(),
    dateDebutDom: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$today"))
      .when("statutDom", {
        is: (statutDom) => !["REFUS", "RADIE"].includes(statutDom),
        then: dateUtcSchema().required(),
      }),
    dateFinDom: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$nextYear"))
      .when("statutDom", {
        is: (statutDom) => !["REFUS", "RADIE"].includes(statutDom),
        then: dateUtcSchema().required(),
      }),
    datePremiereDom: dateUtcSchema(),
    dateDernierPassage: dateUtcSchema()
      .min(yup.ref("$minDate"))
      .max(yup.ref("$today"))
      .notRequired(),
    orientation: booleanOuiNon().notRequired(),
    orientationDetails: yup.string(),
    domiciliationExistante: booleanOuiNon().notRequired(),
    revenus: booleanOuiNon().notRequired(),
    revenusDetails: yup.string(),
    lienCommune: yup.string(),
    compositionMenage: oneOfString([
      "HOMME_ISOLE_SANS_ENFANT",
      "FEMME_ISOLE_SANS_ENFANT",
      "HOMME_ISOLE_AVEC_ENFANT",
      "FEMME_ISOLE_AVEC_ENFANT",
      "COUPLE_SANS_ENFANT",
      "COUPLE_AVEC_ENFANT",
    ]).notRequired(),
    situationResidentielle: oneOfString([
      "DOMICILE_MOBILE",
      "HEBERGEMENT_SOCIAL",
      "HEBERGEMENT_TIERS",
      "HOTEL",
      "SANS_ABRI",
      "AUTRE",
    ]).notRequired(),
    situationDetails: yup.string(),
    causeInstabilite: oneOfString([
      "ERRANCE",
      "AUTRE",
      "EXPULSION",
      "HEBERGE_SANS_ADRESSE",
      "ITINERANT",
      "RUPTURE",
      "SORTIE_STRUCTURE",
      "VIOLENCE",
    ]).notRequired(),
    causeDetails: yup.string(),
    raisonDemande: oneOfString([
      "EXERCICE_DROITS",
      "PRESTATIONS_SOCIALES",
      "AUTRE",
    ]).notRequired(),
    raisonDemande_details: yup.string(),
    accompagnement: booleanOuiNon().notRequired(),
    accompagnementDetails: yup.string(),
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
          lienParente: oneOfString([
            "ENFANT",
            "CONJOINT",
            "PARENT",
            "AUTRE",
          ]).required(),
        })
      )
      .default([]),
  })
  .label("UsagersImportUsager");

export type UsagersImportUsager = TypeOf<typeof UsagersImportUsagerSchema>;
