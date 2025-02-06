import { type UsagerOptionsProcuration } from "./UsagerOptionsProcuration.interface";
import { type UsagerOptionsTransfert } from "./UsagerOptionsTransfert.interface";

export interface UsagerOptions {
  transfert: UsagerOptionsTransfert;
  procurations: UsagerOptionsProcuration[];
  npai: {
    actif: boolean;
    dateDebut?: Date | null;
  };
  portailUsagerEnabled: boolean;
}
