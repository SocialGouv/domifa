export interface Options {
  transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut: Date;
  };
  procuration: {
    actif: boolean;
    nom: string;
    prenom: string;
    dateFin: Date;
  };
  dnp: {
    actif: boolean;
    dateDebut: Date;
  };
}
