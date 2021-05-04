import { StructureStatsQuestionsRaisonDemande } from "./StructureStatsQuestionsRaisonDemande.type";
import { StructureStatsSexe } from "./StructureStatsSexe.type";
import { StructureStatsTranchesAge } from "./StructureStatsTranchesAge.type";

export type StructureStatsQuestionsAtDate = {
  /* NOMBRE D'USAGER PAR STATUT au 31/12 */
  Q_11: {
    REFUS: number; // pas dans le rapport, mais utilisé pour les stats domifa
    RADIE: number; // pas dans le rapport, mais utilisé pour les stats domifa
    VALIDE: number; // pas dans le rapport, mais utilisé pour les stats domifa
    VALIDE_TOTAL: number;
    VALIDE_AYANTS_DROIT: number;
  };

  /* Q_14: réorientation suite au refus d'élection de domicile  */
  Q_14: {
    CCAS: number;
    ASSO: number;
  };

  Q_19: {
    COUPLE_AVEC_ENFANT: number;
    COUPLE_SANS_ENFANT: number;
    FEMME_ISOLE_AVEC_ENFANT: number;
    FEMME_ISOLE_SANS_ENFANT: number;
    HOMME_ISOLE_AVEC_ENFANT: number;
    HOMME_ISOLE_SANS_ENFANT: number;
  };

  /* AUTRES QUESTIONS DE L'ENTRETIEN */
  Q_21: {
    AUTRE: number;
    ERRANCE: number;
    EXPULSION: number;
    HEBERGE_SANS_ADRESSE: number;
    ITINERANT: number;
    RUPTURE: number;
    SORTIE_STRUCTURE: number;
    VIOLENCE: number;
    NON_RENSEIGNE: number;
    RAISON_DEMANDE: StructureStatsQuestionsRaisonDemande;
  };

  /* SITUATION RESIDENTIELLE */
  Q_22: {
    AUTRE: number;
    DOMICILE_MOBILE: number;
    HEBERGEMENT_SOCIAL: number;
    HEBERGEMENT_TIERS: number;
    HOTEL: number;
    SANS_ABRI: number;
    NON_RENSEIGNE: number;
  };

  USAGERS: {
    SEXE: StructureStatsSexe;
    TRANCHE_AGE: StructureStatsTranchesAge;
  };
};
