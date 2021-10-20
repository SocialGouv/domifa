import { UsagerAyantDroit, AyantDroiLienParent } from "../../../../_common";

export class AyantDroit implements UsagerAyantDroit {
  public dateNaissance: Date;
  public lien: AyantDroiLienParent;
  public nom: string;
  public prenom: string;

  constructor(ayantDroit?: UsagerAyantDroit) {
    this.nom = (ayantDroit && ayantDroit.nom) || "";
    this.prenom = (ayantDroit && ayantDroit.prenom) || "";
    this.dateNaissance =
      ayantDroit && ayantDroit.dateNaissance
        ? new Date(ayantDroit.dateNaissance)
        : new Date();

    this.lien = (ayantDroit && ayantDroit.lien) || "AUTRE";
  }
}
