import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { formatDateToNgb } from "src/app/shared/bootstrap-util";

export class Options {
  public transfert: {
    actif: boolean;
    nom: string;
    adresse: string;
    dateDebut: Date;
  };

  public procuration: {
    actif: boolean;
    nom: string;
    prenom: string;
    dateFin: Date;
    dateFinPicker: NgbDateStruct;
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
      dateFin: null,
      dateFinPicker: null,
      nom: null,
      prenom: null
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

      if (typeof options.dnp !== "undefined") {
        this.dnp.actif = options.dnp.actif || false;
        if (options.dnp.dateDebut && options.dnp.dateDebut !== null) {
          this.dnp.dateDebut = new Date(options.dnp.dateDebut);
        }
      }
    }
  }
}
