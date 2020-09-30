export class HistoriqueOptions {
  public user: string;
  public date: Date;
  public action: string;
  public content: {
    adresse?: string | null;
    dateDebut?: Date | null;
    dateFin?: Date | null;
    dateNaissance?: Date | null;
    nom?: string;
    prenom?: string;
  };
  constructor(options?: any) {
    this.user = (options && options.user) || "";
    this.date = (options && options.date) || null;
    this.action = (options && options.action) || "";

    if (!options.content) {
      this.content = {
        adresse: null,
        dateDebut: null,
        dateFin: null,
        dateNaissance: null,
        nom: null,
        prenom: null,
      };
    } else {
      this.content.adresse = (options && options.adresse) || "";
      this.content.dateDebut = (options && new Date(options.dateDebut)) || null;
      this.content.dateFin = (options && new Date(options.dateFin)) || null;
      this.content.dateNaissance =
        (options && new Date(options.dateNaissance)) || null;
      this.content.nom = (options && options.nom) || "";
      this.content.prenom = (options && options.prenom) || "";
    }
  }
}
