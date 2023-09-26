import { type UsagerOptionsProcuration } from "./UsagerOptionsProcuration.type";
import { type UsagerOptionsTransfert } from "./UsagerOptionsTransfert.type";

export interface UsagerOptions {
  transfert: UsagerOptionsTransfert;
  procurations: UsagerOptionsProcuration[];
  npai: {
    actif: boolean;
    dateDebut?: Date | null;
  };
  portailUsagerEnabled: boolean;
}
