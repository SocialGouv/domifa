import { UsagerOptionsProcuration } from "./UsagerOptionsProcuration.class";
import { UsagerOptionsTransfert } from "./UsagerOptionsTransfert.class";

export class UsagerOptions {
  public transfert: UsagerOptionsTransfert;
  public procurations: UsagerOptionsProcuration[] = [];
  public portailUsagerEnabled = false;

  public npai: {
    actif: boolean;
    dateDebut: Date | null;
  };

  constructor(options?: UsagerOptions) {
    this.npai = {
      actif: false,
      dateDebut: null,
    };

    this.transfert = new UsagerOptionsTransfert(options?.transfert);

    if (options?.procurations?.length) {
      this.procurations = options.procurations.map(
        (apiProcuration: UsagerOptionsProcuration) =>
          new UsagerOptionsProcuration(apiProcuration)
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
