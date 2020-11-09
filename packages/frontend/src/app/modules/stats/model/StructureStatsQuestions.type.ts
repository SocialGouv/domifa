export type StructureStatsQuestions = {
  /* Nombre attestations delivres durant l'année */
  Q_10: number;
  /* Dont première demande  */
  Q_10_A: number;
  /* Dont renouvellement */
  Q_10_B: number;

  /* NOMBRE D'USAGER PAR STATUT au 31/12 */
  Q_11: {
    REFUS: number;
    RADIE: number;
    VALIDE: number;
    VALIDE_TOTAL: number;
    VALIDE_AYANTS_DROIT: number;
  };

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

  /* Q_14: réorientation suite au refus d'élection de domicile  */
  Q_14: {
    CCAS: number;
    ASSO: number;
  };

  /* Q 16 : DOMICILIES VALIDE + AYANTS-DROIT*/
  // TODO : Convertir en date les date de naissance des Ayant-droit

  /* ----------------------------------- */
  // TODO : Convertir en date les date de naissance des Ayant-droit
  /* DONNEES A CALCULER A PARTIR DES DATES DE NAISSANCE */
  /* Q 17 : Nombre total de mineurs domiciliés au 31/12/2018 : */
  /* Q 18 : Nombre total de majeurs domiciliés au 31/12/2018 : */
  /* ----------------------------------- */
  Q_17: number;
  Q_18: number;

  /* ----------------------------------- */
  /* STATS Q19 : PARTIE SUR LES QUESTIONS DE L'ENTRETIEN */
  /* Nombre total d'hommes isolés avec enfant(s), (familles monoparentales) domiciliés */
  /* Nombre total de femmes isolées sans enfant  */
  /* Nombre total de femmes isolées avec enfant(s),*/
  /* Nombre total de couples sans enfant domiciliés */
  /* Nombre total de couples avec enfant(s) domiciliés */
  /* ----------------------------------- */

  Q_19: {
    COUPLE_AVEC_ENFANT: number;
    COUPLE_SANS_ENFANT: number;
    FEMME_ISOLE_AVEC_ENFANT: number;
    FEMME_ISOLE_SANS_ENFANT: number;
    HOMME_ISOLE_AVEC_ENFANT: number;
    HOMME_ISOLE_SANS_ENFANT: number;
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
};
