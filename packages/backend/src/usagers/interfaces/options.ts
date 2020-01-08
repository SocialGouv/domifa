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
    dateNaissance: string;
  };
  dnp: {
    actif: boolean;
    dateDebut: Date;
  };
}
