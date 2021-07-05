import { UsagerOptionsTransfert } from "../../../../_common/model/usager";

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
