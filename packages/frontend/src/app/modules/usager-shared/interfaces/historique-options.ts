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

    this.content = {
      adresse: null,
      dateDebut: null,
      dateFin: null,
      dateNaissance: null,
      nom: null,
      prenom: null,
    };

    if (typeof options.content !== "undefined") {
      this.content.adresse = (options && options.content.adresse) || "";
      this.content.nom = (options && options.content.nom) || "";
      this.content.prenom = (options && options.content.prenom) || "";

      if (options.content.dateDebut && options.content.dateDebut !== null) {
        this.content.dateDebut = new Date(options.content.dateDebut);
      }

      if (options.content.dateFin && options.content.dateFin !== null) {
        this.content.dateFin = new Date(options.content.dateFin);
      }

      if (
        options.content.dateNaissance &&
        options.content.dateNaissance !== null
      ) {
        this.content.dateNaissance = new Date(options.content.dateNaissance);
      }
    }
  }
}
