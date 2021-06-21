import { UsagerLight } from "../../../../_common/model";

export function isProcurationActifMaintenant(
  usager: Pick<UsagerLight, "options">
): boolean {
  if (usager.options.procuration.actif) {
    const debut = new Date(usager.options.procuration.dateDebut).getTime();
    const fin = new Date(usager.options.procuration.dateFin).getTime();
    const now = new Date().getTime();
    return debut < now && fin > now;
  }
  return false;
}
