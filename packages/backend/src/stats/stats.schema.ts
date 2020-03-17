import * as mongoose from "mongoose";

export const StatsSchema = new mongoose.Schema({
  capacite: Number,
  codePostal: String,
  date: { type: Date, default: Date.now },
  departement: String,
  ville: String,
  nom: String,
  questions: {
    /* Nombre attestations delivres durant l'année */
    Q_10: Number,

    /* Dont première demande  */
    Q_10_A: Number,

    /* Dont renouvellement */
    Q_10_B: Number,

    /* Domicilié par statut au 31/12 */
    Q_11: {
      REFUS: Number,
      RADIE: Number,
      VALIDE: Number,
      VALIDE_AYANTS_DROIT: Number,
      VALIDE_TOTAL: Number
    },

    Q_12: {
      A_SA_DEMANDE: Number,
      ENTREE_LOGEMENT: Number,
      FIN_DE_DOMICILIATION: Number,
      NON_MANIFESTATION_3_MOIS: Number,
      NON_RESPECT_REGLEMENT: Number,
      PLUS_DE_LIEN_COMMUNE: Number,
      TOTAL: Number
    },

    Q_13: {
      AUTRE: Number,
      HORS_AGREMENT: Number,
      LIEN_COMMUNE: Number,
      SATURATION: Number,
      TOTAL: Number
    },

    Q_14: {
      ASSO: Number,
      CCAS: Number
    },

    /* Nombre total de mineurs domiciliés (usagers + ayant-droit) au 31/12 */
    Q_17: Number,

    /* Nombre total de majeurs domiciliés (usagers + ayant-droit) au 31/12 */
    Q_18: Number,

    Q_19: {
      COUPLE_AVEC_ENFANT: Number,
      COUPLE_SANS_ENFANT: Number,
      FEMME_ISOLE_AVEC_ENFANT: Number,
      FEMME_ISOLE_SANS_ENFANT: Number,
      HOMME_ISOLE_AVEC_ENFANT: Number,
      HOMME_ISOLE_SANS_ENFANT: Number,
      MINEUR: Number
    },

    /* NOMBRE D'INTERACTIONS GLOBALES */
    Q_20: {
      appel: Number,
      colisIn: Number,
      colisOut: Number,
      courrierIn: Number,
      courrierOut: Number,
      recommandeIn: Number,
      recommandeOut: Number,
      visite: Number
    },

    Q_21: {
      ERRANCE: Number,
      EXPULSION: Number,
      HEBERGE_SANS_ADRESSE: Number,
      ITINERANT: Number,
      RUPTURE: Number,
      SORTIE_STRUCTURE: Number,
      VIOLENCE: Number
    }
  },
  structureId: Number,
  structureType: String
});
