import { UsagerOptionsHistorique } from "./UsagerOptionsHistorique.type";

export type UsagerOptions = {
  transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut?: Date;
    dateFin?: Date;
  };
  procuration: {
    actif: boolean;
    nom?: string;
    prenom?: string;
    dateFin?: Date;
    dateDebut?: Date;
    dateNaissance?: Date;
  };
  npai: {
    actif: boolean;
    dateDebut?: Date;
  };
  historique: {
    transfert: UsagerOptionsHistorique[];
    procuration: UsagerOptionsHistorique[];
  };
};
