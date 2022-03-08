import { UsagerProcuration } from ".";
import {
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../../../../_common/model";
import { UsagerOptions } from "./../../../../_common/model/usager/UsagerOptions.type";
import { HistoriqueOptions } from "./historique-options";

export class Options implements UsagerOptions {
  public transfert: UsagerOptionsTransfert;
  public procuration?: UsagerOptionsProcuration;
  public procurations: UsagerOptionsProcuration[];

  public portailUsagerEnabled: boolean;

  public npai: {
    actif: boolean;
    dateDebut: Date | null;
  };

  public historique?: {
    transfert: HistoriqueOptions[];
    procuration: HistoriqueOptions[];
  };

  constructor(options?: Partial<UsagerOptions>) {
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

    this.procurations = [];

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

      if (typeof options.procurations !== "undefined") {
        // Maximum 2 procurations
        for (let i = 0; i < 2; i++) {
          this.procurations[i] = new UsagerProcuration(options.procurations[i]);
        }
      }

      if (typeof options.npai !== "undefined") {
        this.npai.actif = options.npai.actif || false;
        if (options.npai.dateDebut && options.npai.dateDebut !== null) {
          this.npai.dateDebut = new Date(options.npai.dateDebut);
        }
      }
    }
    this.portailUsagerEnabled = options?.portailUsagerEnabled;
  }
}
