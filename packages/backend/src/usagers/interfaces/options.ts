export interface Options {
  transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut: Date;
  };
  procuration: {
    actif: boolean;
    noms: string[];
  };
  dnp: {
    actif: boolean;
    dateDebut: Date;
  };
}
