import { AppUser } from "../../../_common/model";

export class Structure {
  public id: number;
  public _id: string;
  public adresse: string;

  public capacite: number;
  public complementAdresse: string;

  public nom: string;
  public structureType: string;
  public ville: string;
  public departement: string;
  public codePostal: string;
  public region: string;
  public agrement: string;
  public phone: string;
  public email: string;
  public import: boolean;
  public importDate: Date;
  public lastLogin: Date;
  public verified: boolean;
  public stats: { VALIDE: number; REFUS: number; RADIE: number; TOTAL: number };

  public responsable: {
    fonction: string;
    nom: string;
    prenom: string;
  };

  public options: {
    colis: boolean;
    customId: boolean;
    rattachement: boolean;
    numeroBoite: boolean;
  };

  public adresseCourrier: {
    actif: boolean;
    adresse: string;
    ville: string;
    codePostal: string;
  };

  public createdAt: Date | null;
  public usersCount?: number;

  constructor(structure?: any) {
    this.createdAt = null;
    this.importDate = null;
    this.lastLogin = null;

    this._id = (structure && structure._id) || null;
    this.id = (structure && structure.id) || 0;
    this.capacite = (structure && structure.capacite) || null;
    this.adresse = (structure && structure.adresse) || null;

    this.complementAdresse = (structure && structure.complementAdresse) || "";
    this.nom = (structure && structure.nom) || "";

    this.structureType = (structure && structure.structureType) || "";
    this.ville = (structure && structure.ville) || "";
    this.departement = (structure && structure.departement) || "";
    this.codePostal = (structure && structure.codePostal) || "";
    this.region = (structure && structure.region) || "";
    this.agrement = (structure && structure.agrement) || "";
    this.phone = (structure && structure.phone) || "";
    this.email = (structure && structure.email) || "";
    this.import = (structure && structure.import) || false;
    this.verified = (structure && structure.verified) || false;

    this.usersCount = (structure && structure.usersCount) || 0;
    this.adresseCourrier = (structure && structure.adresseCourrier) || {
      actif: false,
      adresse: "",
      ville: "",
      codePostal: "",
    };

    this.responsable = (structure && structure.responsable) || {
      fonction: "",
      nom: "",
      prenom: "",
    };

    this.options = {
      colis: false,
      customId: false,
      numeroBoite: false,
      rattachement: false,
    };
    if (structure && structure.options) {
      this.options.colis = structure.options.colis || false;
      this.options.customId = structure.options.customId || false;
      this.options.numeroBoite = structure.options.numeroBoite || false;
      this.options.rattachement = structure.options.rattachement || false;
    }

    if (structure && structure.createdAt) {
      this.createdAt = new Date(structure.createdAt);
    }

    this.importDate =
      structure && structure.importDate ? new Date(structure.importDate) : null;
    this.lastLogin =
      structure && structure.lastLogin ? new Date(structure.lastLogin) : null;
  }
}
