import { UsagerOptionsProcuration } from "@domifa/common";
import { UsagerOptionsTransfert } from "./UsagerOptionsTransfert.type";

export type UsagerOptions = {
  transfert: UsagerOptionsTransfert;
  procurations: UsagerOptionsProcuration[];
  npai: {
    actif: boolean;
    dateDebut: Date | null;
  };
  portailUsagerEnabled?: boolean;
};
