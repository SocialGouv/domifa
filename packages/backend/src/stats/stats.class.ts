import { Document } from "mongoose";

export class Stats {
  public date: Date;
  public nom: string;
  public structureId: number;
  public structureType: string;
  public departement: string;
  public capacite: number;
  public codePostal: string;
  public questions: {
    /* Nombre attestations delivres durant l'année */
    Q_10: number;
    /* Dont première demande  */
    Q_10_A: number;
    /* Dont renouvellement */
    Q_10_B: number;

    /* Nombre total d'attestations d'élection de domicile en cours de validité à la fin de l'année */
    Q_11: number;

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

    /* */

    /* */
  };

  constructor(data?: any) {
    this.date = (data && new Date(data.date)) || new Date();
    this.nom = (data && data.nom) || null;
    this.structureType = (data && data.structureType) || null;
    this.structureId = (data && data.structureId) || null;
    this.departement = (data && data.departement) || null;
    this.capacite = (data && data.capacite) || null;
    this.codePostal = (data && data.codePostal) || null;
    this.questions = (data && data.questions) || {
      Q_10: 0,
      Q_10_A: 0,
      Q_10_B: 0,
      Q_11: 0,
      Q_12: {
        A_SA_DEMANDE: 0,
        ENTREE_LOGEMENT: 0,
        FIN_DE_DOMICILIATION: 0,
        NON_MANIFESTATION_3_MOIS: 0,
        NON_RESPECT_REGLEMENT: 0,
        PLUS_DE_LIEN_COMMUNE: 0,
        TOTAL: 0
      },
      Q_13: {
        AUTRE: 0,
        HORS_AGREMENT: 0,
        LIEN_COMMUNE: 0,
        SATURATION: 0,
        TOTAL: 0
      }
    };
  }
}
