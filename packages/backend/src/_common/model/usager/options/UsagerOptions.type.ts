import { UsagerOptionsHistorique } from "./UsagerOptionsHistorique.type";
import { UsagerOptionsProcuration } from "./UsagerOptionsProcuration.type";
import { UsagerOptionsTransfert } from "./UsagerOptionsTransfert.type";

export type UsagerOptions = {
  transfert: UsagerOptionsTransfert;
  // TODO: Supprimer cette partie
  procuration?: UsagerOptionsProcuration;
  procurations: UsagerOptionsProcuration[];
  npai: {
    actif: boolean;
    dateDebut?: Date | null;
  };
  // TODO: Supprimer cette partie
  historique?: {
    transfert: UsagerOptionsHistorique[];
    procuration: UsagerOptionsHistorique[];
  };
  portailUsagerEnabled: boolean;
};
