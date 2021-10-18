import { AyantDroiLienParent } from "./../../../../_common/model/usager/AyantDroitLienParente.type";
import { UsagerAyantDroit } from "../../../../_common/model/usager/UsagerAyantDroit.type";

export class AyantDroit implements UsagerAyantDroit {
  public dateNaissance: Date;
  public lien: AyantDroiLienParent | null;
  public nom: string;
  public prenom: string;

  constructor(ayantDroit?: UsagerAyantDroit) {
    this.nom = (ayantDroit && ayantDroit.nom) || "";
    this.prenom = (ayantDroit && ayantDroit.prenom) || "";
    this.dateNaissance = ayantDroit?.dateNaissance
      ? new Date(ayantDroit.dateNaissance)
      : null;
    this.lien = (ayantDroit && ayantDroit.lien) || null;
  }
}
