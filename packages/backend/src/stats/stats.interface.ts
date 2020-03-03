import { Document } from "mongoose";

export interface Stats extends Document {
  id: number;
  nom: string;
  structureType: string;
  departement: string;
  capacite: number;
  codePostal: string;
  questions: {
    /* Nombre attestations delivres durant l'année */
    Q_10: number;
    /* Dont première demande  */
    Q_10_A: number;
    /* Dont renouvellement */
    Q_10_B: number;
    /* Nombre total d'attestations d'élection de domicile en cours de validité à la fin de l'année */
    Q_11: number;

    Q_12: {
      TOTAL: number;
      A_SA_DEMANDE: number;
      ENTREE_LOGEMENT: number;
      FIN_DE_DOMICILIATION: number;
      NON_MANIFESTATION_3_MOIS: number;
      NON_RESPECT_REGLEMENT: number;
      PLUS_DE_LIEN_COMMUNE: number;
    };
    Q_13: {
      TOTAL: number;
      AUTRE: number;
      HORS_AGREMENT: number;
      LIEN_COMMUNE: number;
      SATURATION: number;
    };
  };
}
