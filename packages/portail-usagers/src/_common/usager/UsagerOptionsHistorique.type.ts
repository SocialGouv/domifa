export type UsagerOptionsHistorique = {
  user: string;
  date: Date;
  action: string;
  content: {
    adresse?: string | null;
    dateDebut?: Date | null;
    dateFin?: Date | null;
    dateNaissance?: Date | null;
    nom?: string;
    prenom?: string;
  };
};
