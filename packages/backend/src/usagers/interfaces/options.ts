export interface Options {
  transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut?: Date | null;
  };
  procuration: {
    actif: boolean;
    nom: string;
    prenom: string;
    dateFin: Date | null;
    dateNaissance: string | null;
  };
  dnp: {
    actif: boolean;
    dateDebut: Date | null;
  };
}
