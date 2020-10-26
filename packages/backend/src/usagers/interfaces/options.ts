export interface Options {
  transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut: Date | null;
    dateFin: Date | null;
  };
  procuration: {
    actif: boolean;
    nom: string;
    prenom: string;
    dateFin: Date | null;
    dateDebut: Date | null;
    dateNaissance: string | null;
  };
  npai: {
    actif: boolean;
    dateDebut: Date | null;
  };
  historique: {
    transfert: HistoriqueOptions[];
    procuration: HistoriqueOptions[];
  };
}

export interface HistoriqueOptions {
  user: string;
  date: Date;
  action: string;
  content?: {};
}
