import { UsagerOptions } from "./../../../../_common/model/usager/UsagerOptions.type";
import { HistoriqueOptions } from "./historique-options";

export class Options implements UsagerOptions {
  public transfert: {
    actif: boolean;
    adresse: string | null;
    dateDebut: Date | null;
    dateFin: Date | null;
    nom: string | null;
  };

  public procuration: {
    actif: boolean;
    dateDebut: Date | null;
    dateFin: Date | null;
    dateNaissance: Date | null;
    nom: string;
    prenom: string;
  };

  public npai: {
    actif: boolean;
    dateDebut: Date | null;
  };

  public historique: {
    transfert: HistoriqueOptions[];
    procuration: HistoriqueOptions[];
  };

  constructor(options?: any) {
    this.transfert = {
      actif: false,
      adresse: "",
      dateDebut: null,
      dateFin: null,
      nom: "",
    };

    this.npai = {
      actif: false,
      dateDebut: null,
    };

    this.procuration = {
      actif: false,
      dateDebut: null,
      dateFin: null,
      dateNaissance: null,
      nom: "",
      prenom: "",
    };

    this.historique = {
      transfert: [],
      procuration: [],
    };

    if (options) {
      if (typeof options.transfert !== "undefined") {
        this.transfert.actif = options.transfert.actif || false;
        this.transfert.nom = options.transfert.nom || "";
        this.transfert.adresse = options.transfert.adresse || "";

        this.transfert.dateDebut =
          options.transfert.dateDebut && options.transfert.dateDebut !== null
            ? new Date(options.transfert.dateDebut)
            : (this.transfert.dateDebut = null);

        this.transfert.dateFin =
          options.transfert.dateFin && options.transfert.dateFin !== null
            ? new Date(options.transfert.dateFin)
            : (this.transfert.dateFin = null);
      }

      if (typeof options.procuration !== "undefined") {
        this.procuration.actif = options.procuration.actif || false;
        this.procuration.nom = options.procuration.nom || "";
        this.procuration.prenom = options.procuration.prenom || "";

        if (
          options.procuration.dateNaissance &&
          options.procuration.dateNaissance !== null
        ) {
          this.procuration.dateNaissance = new Date(
            options.procuration.dateNaissance
          );
        }
        if (
          options.procuration.dateFin &&
          options.procuration.dateFin !== null
        ) {
          this.procuration.dateFin = new Date(options.procuration.dateFin);
        }
        if (
          options.procuration.dateDebut &&
          options.procuration.dateDebut !== null
        ) {
          this.procuration.dateDebut = new Date(options.procuration.dateDebut);
        }
      }

      if (typeof options.npai !== "undefined") {
        this.npai.actif = options.npai.actif || false;
        if (options.npai.dateDebut && options.npai.dateDebut !== null) {
          this.npai.dateDebut = new Date(options.npai.dateDebut);
        }
      }

      this.historique = {
        transfert: [],
        procuration: [],
      };

      if (typeof options.historique !== "undefined") {
        if (options.historique.transfert.length > 0) {
          this.historique.transfert = Array.isArray(
            options.historique.transfert
          )
            ? options.historique.transfert.map(
                (item: HistoriqueOptions) => new HistoriqueOptions(item)
              )
            : [new HistoriqueOptions(options.historique.transfert)];
        }

        if (options.historique.procuration.length > 0) {
          this.historique.procuration = Array.isArray(
            options.historique.procuration
          )
            ? options.historique.procuration.map(
                (item: HistoriqueOptions) => new HistoriqueOptions(item)
              )
            : [new HistoriqueOptions(options.historique.procuration)];
        }
      }
    }
  }
}
