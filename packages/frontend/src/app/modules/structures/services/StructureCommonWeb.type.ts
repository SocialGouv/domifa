import {
  StructureAddresseCourrier,
  StructureCommon,
  StructurePortailUsagerParams,
  StructureResponsable,
  StructureSmsParams,
  StructureType,
} from "../../../../_common/model";
import { Telephone } from "src/_common/model/common";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export class StructureCommonWeb implements StructureCommon {
  id: number;
  createdAt: Date;
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
  telephone: Telephone;
  email: string;
  responsable: StructureResponsable;
  options: { numeroBoite: boolean };
  adresseCourrier: StructureAddresseCourrier;
  sms: StructureSmsParams;
  portailUsager: StructurePortailUsagerParams;

  constructor(structure?: Partial<StructureCommon>) {
    this.id = (structure && structure.id) || 0;
    this.createdAt = (structure && structure.createdAt) || null;
    this.capacite = (structure && structure.capacite) || null;
    this.adresse = (structure && structure.adresse) || null;

    this.complementAdresse = (structure && structure.complementAdresse) || "";
    this.nom = (structure && structure.nom) || "";

    this.structureType = (structure && structure.structureType) || null;
    this.ville = (structure && structure.ville) || "";
    this.departement = (structure && structure.departement) || "";
    this.codePostal = (structure && structure.codePostal) || "";
    this.region = (structure && structure.region) || "";
    this.agrement = (structure && structure.agrement) || "";
    this.telephone = (structure && structure.telephone) || {
      numero: "",
      indicatif: "fr",
    };
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

    this.sms = (structure && structure.sms) || {
      enabledByDomifa: true,
      enabledByStructure: false,
      senderName: null,
      senderDetails: null,
    };

    this.portailUsager = (structure && structure.portailUsager) || {
      enabledByDomifa: false,
      enabledByStructure: false,
    };
  }
}
