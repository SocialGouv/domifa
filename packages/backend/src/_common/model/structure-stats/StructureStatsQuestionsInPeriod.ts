export type StructureStatsQuestionsInPeriod = {
  /* Nombre attestations delivres durant l'année */
  Q_10: number;
  /* Dont première demande  */
  Q_10_A: number;
  /* Dont renouvellement */
  Q_10_B: number;

  /* Q12 :Nombre total de radiations durant l'année:*/
  Q_12: {
    AUTRE: number;
    TOTAL: number;
    A_SA_DEMANDE: number;
    ENTREE_LOGEMENT: number;
    FIN_DE_DOMICILIATION: number;
    NON_MANIFESTATION_3_MOIS: number;
    NON_RESPECT_REGLEMENT: number;
    PLUS_DE_LIEN_COMMUNE: number;
  };

  /* Q13 :Nombre total de refus d'élection de domicile durant l'année */
  Q_13: {
    TOTAL: number;
    AUTRE: number;
    HORS_AGREMENT: number;
    LIEN_COMMUNE: number;
    SATURATION: number;
  };
  /* NOMBRE D'INTERACTIONS GLOBALES */
  Q_20: {
    appel: number;
    colisIn: number;
    colisOut: number;
    courrierIn: number;
    courrierOut: number;
    recommandeIn: number;
    recommandeOut: number;
    visite: number;
    npai: number;
  };
};
