export class AyantDroit {
  public dateNaissance: Date;
  public lien: string;
  public nom: string;
  public prenom: string;

  constructor(ayantDroit?: any) {
    this.nom = (ayantDroit && ayantDroit.nom) || "";
    this.prenom = (ayantDroit && ayantDroit.prenom) || "";
    this.dateNaissance = (ayantDroit && ayantDroit.dateNaissance) || "";
    this.lien = (ayantDroit && ayantDroit.lien) || "";
  }
}
