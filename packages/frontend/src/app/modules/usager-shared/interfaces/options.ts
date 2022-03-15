import {
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../../../../_common/model";
import { UsagerOptions } from "../../../../_common/model/usager/options/UsagerOptions.type";

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
    this.npai = {
      actif: false,
      dateDebut: null,
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

      if (typeof options.procurations !== "undefined") {
        this.procurations = options.procurations.map(
          (apiProcuration: UsagerOptionsProcuration) => {
            const procuration: UsagerOptionsProcuration = {
              nom: null,
              prenom: null,
              dateNaissance: null,
              dateFin: null,
              dateDebut: null,
            };

            procuration.nom = apiProcuration?.nom ?? null;
            procuration.prenom = apiProcuration?.prenom ?? null;

            if (apiProcuration.dateNaissance) {
              procuration.dateNaissance = new Date(
                apiProcuration.dateNaissance
              );
            }
            if (apiProcuration.dateFin) {
              procuration.dateFin = new Date(apiProcuration.dateFin);
            }
            if (apiProcuration.dateDebut) {
              procuration.dateDebut = new Date(apiProcuration.dateDebut);
            }
            return procuration;
          }
        );
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
