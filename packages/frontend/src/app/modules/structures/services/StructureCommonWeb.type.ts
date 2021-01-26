import {
  StructureAddresseCourrier,
  StructureCommon,
  StructureResponsable,
  StructureType,
} from "../../../../_common/model";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
export class StructureCommonWeb implements StructureCommon {
  id: number;
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: StructureType;
  ville: string;
  departement: string;
  region: string;
  capacite: number;
  codePostal: string;
  agrement: string;
  phone: string;
  email: string;
  responsable: StructureResponsable;
  options: { numeroBoite: boolean };
  adresseCourrier: StructureAddresseCourrier;

  constructor(structure?: Partial<StructureCommon>) {
    this.id = (structure && structure.id) || 0;
    this.capacite = (structure && structure.capacite) || null;
    this.adresse = (structure && structure.adresse) || null;

    this.complementAdresse = (structure && structure.complementAdresse) || "";
    this.nom = (structure && structure.nom) || "";

    this.structureType = (structure && structure.structureType) || ("" as any);
    this.ville = (structure && structure.ville) || "";
    this.departement = (structure && structure.departement) || "";
    this.codePostal = (structure && structure.codePostal) || "";
    this.region = (structure && structure.region) || "";
    this.agrement = (structure && structure.agrement) || "";
    this.phone = (structure && structure.phone) || "";
    this.email = (structure && structure.email) || "";
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
      numeroBoite: false,
    };

    if (structure && structure.options) {
      this.options.numeroBoite = structure.options.numeroBoite || false;
    }
  }
}
