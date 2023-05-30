import {
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../../../../_common/model";
import { UsagerOptions } from "../../../../_common/model/usager/options/UsagerOptions.type";
import { UsagerProcuration } from "./UsagerProcuration.interface";

export class Options implements UsagerOptions {
  public transfert: UsagerOptionsTransfert = {
    actif: false,
    adresse: null,
    dateDebut: null,
    dateFin: null,
    nom: null,
  };

  public procurations: UsagerOptionsProcuration[] = [];

  public portailUsagerEnabled: boolean;

  public npai: {
    actif: boolean;
    dateDebut: Date | null;
  };

  constructor(options?: UsagerOptions) {
    this.transfert = {
      actif: false,
      adresse: null,
      dateDebut: null,
      dateFin: null,
      nom: null,
    };

    this.npai = {
      actif: false,
      dateDebut: null,
    };

    if (options) {
      if (options.transfert) {
        const { actif, nom, adresse, dateDebut, dateFin } = options.transfert;
        this.transfert = {
          actif: actif || false,
          nom: nom || null,
          adresse: adresse || null,
          dateDebut: dateDebut ? new Date(dateDebut) : null,
          dateFin: dateFin ? new Date(dateFin) : null,
        };
      }

      if (options.procurations) {
        this.procurations = options.procurations.map(
          (apiProcuration: UsagerOptionsProcuration) => {
            return new UsagerProcuration(apiProcuration);
          }
        );
      }

      if (options.npai) {
        const { actif, dateDebut } = options.npai;
        this.npai = {
          actif: actif || false,
          dateDebut: dateDebut ? new Date(dateDebut) : null,
        };
      }
    }
    this.portailUsagerEnabled = options?.portailUsagerEnabled ?? false;
  }
}
