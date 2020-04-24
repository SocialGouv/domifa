import { User } from "../users/interfaces/user";

export class Structure {
  public id: number;
  public adresse: string;
  public adresseCourrier: string;
  public capacite: number;
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

  public options: {
    colis: boolean;
    customId: boolean;
    numeroBoite: boolean;
  };

  public users: User[];
  public createdAt: Date | null;

  constructor(structure?: any) {
    this.id = (structure && structure.id) || 0;
    this.capacite = (structure && structure.capacite) || null;
    this.adresse = (structure && structure.adresse) || null;
    this.adresseCourrier = (structure && structure.adresseCourrier) || "";
    this.adresseDifferente = structure && structure.adresseDifferente !== "";
    this.complementAdresse = (structure && structure.complementAdresse) || "";
    this.nom = (structure && structure.nom) || "";
    this.structureType = (structure && structure.structureType) || "";
    this.ville = (structure && structure.ville) || "";
    this.departement = (structure && structure.departement) || "";
    this.codePostal = (structure && structure.codePostal) || "";
    this.agrement = (structure && structure.agrement) || "";
    this.phone = (structure && structure.phone) || "";
    this.email = (structure && structure.email) || "";

    this.responsable = (structure && structure.responsable) || {
      fonction: "",
      nom: "",
      prenom: "",
    };

    this.options = {
      colis: false,
      customId: false,
      numeroBoite: false,
    };
    if (structure && structure.options) {
      this.options.colis = structure.options.colis || false;
      this.options.customId = structure.options.customId || false;
      this.options.numeroBoite = structure.options.numeroBoite || false;
    }

    this.users = (structure && structure.users) || [];

    this.createdAt = null;
    if (structure && structure.createdAt) {
      this.createdAt = new Date(structure.createdAt);
    }
  }
}
