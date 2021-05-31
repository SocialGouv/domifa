export type StructureStatsQuestionsInPeriodDecisions = {
  valid: {
    usagers: {
      total: number; // Q10 - Nombre attestations delivres durant l'année
      premiere_demande: number; // Q_10_A - Dont première demande
      renouvellement: number; // Q_10_B - Dont renouvellement
    };
    ayantsDroits: {
      total: number;
    };
  };
  radie: {
    total: number; // Q12 :Nombre total de radiations durant l'année
    motif: {
      a_sa_demande: number;
      entree_logement: number;
      fin_de_domiciliation: number;
      non_manifestation_3_mois: number;
      non_respect_reglement: number;
      plus_de_lien_commune: number;
      autre: number;
    };
  };
  refus: {
    total: number; // Q13 :Nombre total de refus d'élection de domicile durant l'année
    motif: {
      hors_agrement: number;
      lien_commune: number;
      saturation: number;
      autre: number;
    };
    reorientation: {
      // Q_14: réorientation suite au refus d'élection de domicile
      ccas: number;
      asso: number;
    };
  };
};
