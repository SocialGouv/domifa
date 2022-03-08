import { UsagerOptionsProcuration } from "../../../../_common/model";

export function isProcurationActifMaintenant(
  procurations: UsagerOptionsProcuration[]
): boolean {
  let retour = false;
  for (const procuration of procurations) {
    if (procuration.actif) {
      const debut = new Date(procuration.dateDebut).getTime();
      const fin = new Date(procuration.dateFin).getTime();
      const now = new Date().getTime();
      retour = debut < now && fin > now;
    }

    // Si une des deux procurations est active
    if (retour) {
      return true;
    }
  }

  return retour;
}
