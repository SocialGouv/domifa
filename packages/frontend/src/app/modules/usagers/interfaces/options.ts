import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { formatDateToNgb } from "src/app/shared/bootstrap-util";

export class Options {
  public transfert: {
    actif: boolean;
    nom: string | null;
    adresse: string | null;
    dateDebut: Date | null;
  };

  public procuration: {
    actif: boolean;
    nom: string;
    prenom: string;
    nomComplet: string;
    dateFin: Date | null;
    dateFinPicker: NgbDateStruct | null;
    dateNaissance: string | null;
  };

  public npai: {
    actif: boolean;
    dateDebut: Date | null;
  };

  constructor(options?: any) {
    this.transfert = {
      actif: false,
      adresse: "",
      dateDebut: null,
      nom: ""
    };

    this.npai = {
      actif: false,
      dateDebut: null
    };

    this.procuration = {
      actif: false,
      dateFin: null,
      dateFinPicker: null,
      dateNaissance: null,
      nom: "",
      nomComplet: "",
      prenom: ""
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

      if (typeof options.procuration !== "undefined") {
        this.procuration.actif = options.procuration.actif || false;
        this.procuration.nom = options.procuration.nom || "";
        this.procuration.prenom = options.procuration.prenom || "";
        this.procuration.nomComplet =
          this.procuration.nom.toUpperCase() + " " + this.procuration.prenom ||
          "";
        this.procuration.dateNaissance =
          options.procuration.dateNaissance || "";

        if (
          options.procuration.dateFin &&
          options.procuration.dateFin !== null
        ) {
          this.procuration.dateFin = new Date(options.procuration.dateFin);
          this.procuration.dateFinPicker = formatDateToNgb(
            this.procuration.dateFin
          );
        }
      }

      if (typeof options.npai !== "undefined") {
        this.npai.actif = options.npai.actif || false;
        if (options.npai.dateDebut && options.npai.dateDebut !== null) {
          this.npai.dateDebut = new Date(options.npai.dateDebut);
        }
      }
    }
  }
}
