import { UsagerOptionsProcuration } from "./UsagerOptionsProcuration.type";
import { UsagerOptionsTransfert } from "./UsagerOptionsTransfert.type";

export type UsagerOptions = {
  transfert: UsagerOptionsTransfert;
  procuration: UsagerOptionsProcuration;
  npai: {
    actif: boolean;
    dateDebut?: Date;
  };

  portailUsagerEnabled?: boolean;
};
