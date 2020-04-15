export interface Options {
  transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut?: Date | null;
    dateFin: Date | null;
  };
  procuration: {
    actif: boolean;
    nom: string;
    prenom: string;
    dateFin: Date | null;
    dateNaissance: string | null;
  };
  npai: {
    actif: boolean;
    dateDebut: Date | null;
  };
}
