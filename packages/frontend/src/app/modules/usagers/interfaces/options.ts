export class Options {
  public transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut: Date;
  };
  public procuration: {
    actif: boolean;
    noms: string[];
  };
  public dnp: {
    actif: boolean;
    dateDebut: Date;
  };

  constructor(options?: any) {
    this.transfert = {
      actif: false,
      adresse: "",
      dateDebut: null,
      nom: ""
    };

    this.dnp = {
      actif: false,
      dateDebut: null
    };

    this.procuration = {
      actif: false,
      noms: []
    };

    if (options) {
      if (typeof options.transfert !== "undefined") {
        this.transfert.actif = options.transfert.actif || false;
        this.transfert.nom = options.transfert.nom || "";
        this.transfert.adresse = options.transfert.adresse || "";

        if (
          options.transfert.dateDebut &&
          options.transfert.dateDebut !== null
        ) {
          this.transfert.dateDebut = new Date(options.transfert.dateDebut);
        }
      }
    }
  }
}
