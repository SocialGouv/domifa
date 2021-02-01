import { UsagerAyantDroit } from "../../../../_common/model/usager/UsagerAyantDroit.type";

export class AyantDroit {
  public dateNaissance: Date | string;
  public lien: string;
  public nom: string;
  public prenom: string;

  constructor(ayantDroit?: UsagerAyantDroit) {
    this.nom = (ayantDroit && ayantDroit.nom) || "";
    this.prenom = (ayantDroit && ayantDroit.prenom) || "";
    this.dateNaissance = ayantDroit?.dateNaissance
      ? new Date(ayantDroit.dateNaissance)
      : "";
    this.lien = (ayantDroit && ayantDroit.lien) || "";
  }
}
