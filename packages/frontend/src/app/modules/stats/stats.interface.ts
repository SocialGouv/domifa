export class Stats {
  public createdAt: Date;
  public nom: string;
  public structureId: number;
  public structureType: string;
  public departement: string;
  public ville: string;
  public capacite: number;
  public codePostal: string;
  public questions: {
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
      VALIDE_AYANTS_DROIT: number;
      VALIDE_TOTAL: number;
    };

    /* Q12 :Nombre total de radiations durant l'année:*/
    Q_12: {
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

    /* ----------------------------------- */
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
    };

    /* AUTRES QUESTIONS DE L'ENTRETIEN */
    Q_21: {
      ERRANCE: number;
      AUTRE: number;
      EXPULSION: number;
      HEBERGE_SANS_ADRESSE: number;
      ITINERANT: number;
      NON_RENSEIGNE: number;
      RUPTURE: number;
      SORTIE_STRUCTURE: number;
      VIOLENCE: number;
    };

    Q_22: {
      DOMICILE_MOBILE: number;
      HEBERGEMENT_SOCIAL: number;
      HEBERGEMENT_TIERS: number;
      HOTEL: number;
      SANS_ABRI: number;
      NON_RENSEIGNE: number;
      AUTRE: number;
    };
  };

  constructor(data?: any) {
    if (data && data.createdAt) {
      const createdAt = new Date(data.createdAt);
      this.createdAt = new Date(createdAt.getTime() - 24 * 60 * 60 * 1000);
    } else {
      this.createdAt = new Date();
    }

    this.nom = (data && data.nom) || null;
    this.structureType = (data && data.structureType) || null;
    this.structureId = (data && data.structureId) || null;
    this.departement = (data && data.departement) || null;
    this.ville = (data && data.ville) || null;
    this.capacite = (data && data.capacite) || null;
    this.codePostal = (data && data.codePostal) || null;

    this.questions = (data && data.questions) || {
      Q_10: 0,
      Q_10_A: 0,
      Q_10_B: 0,
      Q_11: {
        REFUS: 0,
        RADIE: 0,
        VALIDE: 0,
        VALIDE_AYANTS_DROIT: 0,
        VALIDE_TOTAL: 0,
      },
      Q_12: {
        A_SA_DEMANDE: 0,
        ENTREE_LOGEMENT: 0,
        FIN_DE_DOMICILIATION: 0,
        NON_MANIFESTATION_3_MOIS: 0,
        NON_RESPECT_REGLEMENT: 0,
        PLUS_DE_LIEN_COMMUNE: 0,
        TOTAL: 0,
      },
      Q_13: {
        AUTRE: 0,
        HORS_AGREMENT: 0,
        LIEN_COMMUNE: 0,
        SATURATION: 0,
        TOTAL: 0,
      },
      Q_14: {
        ASSO: 0,
        CCAS: 0,
      },
      Q_17: 0,
      Q_18: 0,
      Q_19: {
        COUPLE_AVEC_ENFANT: 0,
        COUPLE_SANS_ENFANT: 0,
        FEMME_ISOLE_AVEC_ENFANT: 0,
        FEMME_ISOLE_SANS_ENFANT: 0,
        HOMME_ISOLE_AVEC_ENFANT: 0,
        HOMME_ISOLE_SANS_ENFANT: 0,
      },
      Q_20: {
        appel: 0,
        colisIn: 0,
        colisOut: 0,
        courrierIn: 0,
        courrierOut: 0,
        recommandeIn: 0,
        recommandeOut: 0,
        visite: 0,
      },
      Q_21: {
        AUTRE: 0,
        ERRANCE: 0,
        EXPULSION: 0,
        HEBERGE_SANS_ADRESSE: 0,
        ITINERANT: 0,
        NON_RENSEIGNE: 0,
        RUPTURE: 0,
        SORTIE_STRUCTURE: 0,
        VIOLENCE: 0,
      },
      Q_22: {
        AUTRE: 0,
        DOMICILE_MOBILE: 0,
        HEBERGEMENT_SOCIAL: 0,
        HEBERGEMENT_TIERS: 0,
        HOTEL: 0,
        SANS_ABRI: 0,
        NON_RENSEIGNE: 0,
      },
    };
  }
}
