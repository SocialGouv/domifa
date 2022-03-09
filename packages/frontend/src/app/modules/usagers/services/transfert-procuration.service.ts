import { UsagerOptionsTransfert } from "../../../../_common/model/usager";
import { UsagerOptionsProcuration } from "../../../../_common/model";

export function isTransfertActifMaintenant(
  transfert: UsagerOptionsTransfert
): boolean {
  if (transfert.actif) {
    const debut = new Date(transfert.dateDebut).getTime();
    const fin = new Date(transfert.dateFin).getTime();
    const now = new Date().getTime();
    return debut < now && fin > now;
  }
  return false;
}

export function isProcurationActifMaintenant(
  procuration: UsagerOptionsProcuration
): boolean {
  if (procuration.actif) {
    const debut = new Date(procuration.dateDebut).getTime();
    const fin = new Date(procuration.dateFin).getTime();
    const now = new Date().getTime();
    return debut < now && fin > now;
  }
  return false;
}
