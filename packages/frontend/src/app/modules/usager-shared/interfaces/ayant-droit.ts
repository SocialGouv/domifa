import { AyantDroiLienParent } from "../../../../_common/model/usager/ayant-droit/AyantDroitLienParente.type";
import { UsagerAyantDroit } from "../../../../_common/model/usager/ayant-droit/UsagerAyantDroit.type";

export class AyantDroit implements UsagerAyantDroit {
  public dateNaissance: Date | null;
  public lien: AyantDroiLienParent | null;
  public nom: string;
  public prenom: string;

  constructor(ayantDroit?: UsagerAyantDroit) {
    this.nom = ayantDroit?.nom || "";
    this.prenom = ayantDroit?.prenom || "";
    this.dateNaissance = ayantDroit?.dateNaissance
      ? new Date(ayantDroit.dateNaissance)
      : null;
    this.lien = ayantDroit?.lien || null;
  }
}
