import { User } from "../users/interfaces/user";

export class Structure {
  public adresse: string;
  public complementAdresse: string;
  public nom: string;
  public structureType: number;
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
    this.adresse = (structure && structure.adresse) || "";
    this.complementAdresse = (structure && structure.complementAdresse) || "";
    this.nom = (structure && structure.nom) || "";
    this.structureType = (structure && structure.structureType) || "";
    this.ville = (structure && structure.ville) || "";
    this.departement = (structure && structure.departement) || "";
    this.codePostal = (structure && structure.codePostal) || "";
    this.agrement = (structure && structure.agrement) || "";
    this.phone = (structure && structure.phone) || "";
    this.email = (structure && structure.phone) || "";
    this.responsable = (structure && structure.responsable) || {
      fonction: "",
      nom: "",
      prenom: ""
    };
    this.users = (structure && structure.users) || [];
  }
}
