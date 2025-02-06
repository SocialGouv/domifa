import {
  UsagerOptions,
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "@domifa/common";

import { OptionsTransfert } from "../classes/OptionsTransfert.class";
import { UsagerProcuration } from "../classes";

export class Options implements UsagerOptions {
  public transfert: UsagerOptionsTransfert;
  public procurations: UsagerOptionsProcuration[] = [];
  public portailUsagerEnabled = false;

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

    this.transfert = new OptionsTransfert(options?.transfert);

    if (options?.procurations?.length) {
      this.procurations = options.procurations.map(
        (apiProcuration: UsagerOptionsProcuration) =>
          new UsagerProcuration(apiProcuration)
      );
    }

    if (options?.npai) {
      const { actif, dateDebut } = options.npai;
      this.npai = {
        actif: actif || false,
        dateDebut: dateDebut ? new Date(dateDebut) : null,
      };
    }

    this.portailUsagerEnabled = options?.portailUsagerEnabled ?? false;
  }
}
