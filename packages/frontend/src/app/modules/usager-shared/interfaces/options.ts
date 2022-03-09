import {
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../../../../_common/model";
import { UsagerOptions } from "../../../../_common/model/usager/options/UsagerOptions.type";
import {
  isTransfertActifMaintenant,
  isProcurationActifMaintenant,
} from "../../usagers/services";

export class Options implements UsagerOptions {
  public transfert: UsagerOptionsTransfert;
  public procuration: UsagerOptionsProcuration;
  public portailUsagerEnabled: boolean;

  public npai: {
    actif: boolean;
    dateDebut: Date | null;
  };

  public isProcurationActifMaintenant = false;
  public isTransfertActifMaintenant = false;
  public isProcurationExpired = false;
  public isTransfertExpired = false;
  // TODO : vérifier la validité du transfert & procu direct dans l'interface
  // public transfertExpired: boolean;

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

    this.procuration = {
      actif: false,
      dateDebut: null,
      dateFin: null,
      dateNaissance: null,
      nom: null,
      prenom: null,
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

        this.isTransfertActifMaintenant = isTransfertActifMaintenant(
          this.transfert
        );
      }

      if (typeof options.procuration !== "undefined") {
        this.procuration.actif = options.procuration.actif || false;
        this.procuration.nom = options.procuration.nom || null;
        this.procuration.prenom = options.procuration.prenom || null;

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

        this.isProcurationActifMaintenant = isProcurationActifMaintenant(
          this.procuration
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
