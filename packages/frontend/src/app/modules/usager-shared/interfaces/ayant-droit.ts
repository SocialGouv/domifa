import { AyantDroiLienParent, UsagerAyantDroit } from "@domifa/common";
import { v4 as uuidv4 } from "uuid";

export class AyantDroit implements UsagerAyantDroit {
  public uuid: string;
  public dateNaissance: Date | null;
  public lien: AyantDroiLienParent | null;
  public nom: string;
  public prenom: string;

  constructor(ayantDroit?: UsagerAyantDroit) {
    // generated as soon as the ayant droit exists (new row or loaded from the
    // dossier) so the backend never has to mint one itself
    this.uuid = ayantDroit?.uuid || uuidv4();
    this.nom = ayantDroit?.nom || "";
    this.prenom = ayantDroit?.prenom || "";
    this.dateNaissance = ayantDroit?.dateNaissance
      ? new Date(ayantDroit.dateNaissance)
      : null;
    this.lien = ayantDroit?.lien || null;
  }
}
