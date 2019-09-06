import { User } from "../users/interfaces/user";

export class Structure {
  public id: number;
  public adresse: string;
  public adresseCourrier: string;
  public complementAdresse: string;
  public adresseDifferente: boolean;
  public nom: string;
  public structureType: string;
  public ville: string;
  public departement: string;
  public codePostal: string;
  public agrement: string;
  public phone: string;
  public email: string;
  public responsable: {
    fonction: string;
    nom: string;
    prenom: string;
  };
  public users: User[];

  constructor(structure?: any) {
    this.id = (structure && structure.id) || 0;
    this.adresse = (structure && structure.adresse) || null;
    this.adresseCourrier =
      (structure && structure.adresseCourrier) || "13 rue des pyrénées";
    this.adresseDifferente = structure && structure.adresseCourrier !== "";
    this.complementAdresse = (structure && structure.complementAdresse) || "";
    this.nom = (structure && structure.nom) || "Nom de la structure";
    this.structureType = (structure && structure.structureType) || "";
    this.ville = (structure && structure.ville) || "Paris";
    this.departement = (structure && structure.departement) || "";
    this.codePostal = (structure && structure.codePostal) || "75013";
    this.agrement = (structure && structure.agrement) || "";
    this.phone = (structure && structure.phone) || "0101010101";
    this.email = (structure && structure.phone) || "yassine_test@yopmail.com";
    this.responsable = (structure && structure.responsable) || {
      fonction: "Président",
      nom: "Nom du président",
      prenom: "Prénom du président"
    };
    this.users = (structure && structure.users) || [];
  }
}
