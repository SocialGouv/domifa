import * as mongoose from "mongoose";

export const StatsSchema = new mongoose.Schema(
  {
    capacite: { type: Number, default: 0 },
    codePostal: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    departement: String,
    ville: String,
    nom: String,
    questions: {
      /* Nombre attestations delivres durant l'année */
      Q_10: { type: Number, default: 0 },

      /* Dont première demande  */
      Q_10_A: { type: Number, default: 0 },

      /* Dont renouvellement */
      Q_10_B: { type: Number, default: 0 },

      /* Domicilié par statut au 31/12 */
      Q_11: {
        REFUS: { type: Number, default: 0 },
        RADIE: { type: Number, default: 0 },
        VALIDE: { type: Number, default: 0 },
        VALIDE_AYANTS_DROIT: { type: Number, default: 0 },
        VALIDE_TOTAL: { type: Number, default: 0 },
      },

      Q_12: {
        AUTRE: { type: Number, default: 0 },
        A_SA_DEMANDE: { type: Number, default: 0 },
        ENTREE_LOGEMENT: { type: Number, default: 0 },
        FIN_DE_DOMICILIATION: { type: Number, default: 0 },
        NON_MANIFESTATION_3_MOIS: { type: Number, default: 0 },
        NON_RESPECT_REGLEMENT: { type: Number, default: 0 },
        PLUS_DE_LIEN_COMMUNE: { type: Number, default: 0 },
        TOTAL: { type: Number, default: 0 },
      },

      Q_13: {
        AUTRE: { type: Number, default: 0 },
        HORS_AGREMENT: { type: Number, default: 0 },
        LIEN_COMMUNE: { type: Number, default: 0 },
        SATURATION: { type: Number, default: 0 },
        TOTAL: { type: Number, default: 0 },
      },

      Q_14: {
        ASSO: { type: Number, default: 0 },
        CCAS: { type: Number, default: 0 },
      },

      /* Nombre total de mineurs domiciliés (usagers + ayant-droit) au 31/12 */
      Q_17: { type: Number, default: 0 },

      /* Nombre total de majeurs domiciliés (usagers + ayant-droit) au 31/12 */
      Q_18: { type: Number, default: 0 },

      Q_19: {
        COUPLE_AVEC_ENFANT: { type: Number, default: 0 },
        COUPLE_SANS_ENFANT: { type: Number, default: 0 },
        FEMME_ISOLE_AVEC_ENFANT: { type: Number, default: 0 },
        FEMME_ISOLE_SANS_ENFANT: { type: Number, default: 0 },
        HOMME_ISOLE_AVEC_ENFANT: { type: Number, default: 0 },
        HOMME_ISOLE_SANS_ENFANT: { type: Number, default: 0 },
      },

      /* NOMBRE D'INTERACTIONS GLOBALES */
      Q_20: {
        appel: { type: Number, default: 0 },
        colisIn: { type: Number, default: 0 },
        colisOut: { type: Number, default: 0 },
        courrierIn: { type: Number, default: 0 },
        courrierOut: { type: Number, default: 0 },
        recommandeIn: { type: Number, default: 0 },
        recommandeOut: { type: Number, default: 0 },
        visite: { type: Number, default: 0 },
      },

      Q_21: {
        AUTRE: { type: Number, default: 0 },
        ERRANCE: { type: Number, default: 0 },
        EXPULSION: { type: Number, default: 0 },
        HEBERGE_SANS_ADRESSE: { type: Number, default: 0 },
        ITINERANT: { type: Number, default: 0 },
        RUPTURE: { type: Number, default: 0 },
        SORTIE_STRUCTURE: { type: Number, default: 0 },
        VIOLENCE: { type: Number, default: 0 },
        NON_RENSEIGNE: { type: Number, default: 0 },
      },

      Q_22: {
        AUTRE: { type: Number, default: 0 },
        DOMICILE_MOBILE: { type: Number, default: 0 },
        HEBERGEMENT_SOCIAL: { type: Number, default: 0 },
        HEBERGEMENT_TIERS: { type: Number, default: 0 },
        HOTEL: { type: Number, default: 0 },
        SANS_ABRI: { type: Number, default: 0 },
        NON_RENSEIGNE: { type: Number, default: 0 },
      },
    },
    structureId: Number,
    structureType: String,
  },
  { timestamps: { createdAt: false, updatedAt: false } }
);
