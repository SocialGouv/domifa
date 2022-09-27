import { TimeZone } from "./../../../shared/territoires/types/TimeZone.type";
import {
  StructureAddresseCourrier,
  StructureCommon,
  StructurePortailUsagerParams,
  StructureResponsable,
  StructureSmsParams,
  StructureType,
  Telephone,
} from "../../../../_common/model";
import { CountryISO } from "ngx-intl-tel-input";

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
  capacite: number | null;
  codePostal: string;
  agrement: string | null;
  telephone: Telephone;
  email: string;
  timeZone: TimeZone;
  responsable: StructureResponsable;
  options: { numeroBoite: boolean };
  adresseCourrier: StructureAddresseCourrier;
  sms: StructureSmsParams;
  portailUsager: StructurePortailUsagerParams;

  constructor(structure?: Partial<StructureCommon>) {
    this.id = (structure && structure.id) || 0;
    this.createdAt = (structure && structure.createdAt) || new Date();
    this.capacite = (structure && structure.capacite) || 0;
    this.adresse = (structure && structure.adresse) || "";
    this.timeZone = (structure && structure.timeZone) || "Europe/Paris";

    this.complementAdresse = (structure && structure.complementAdresse) || "";
    this.nom = (structure && structure.nom) || "";

    this.structureType = (structure && structure.structureType) || "ccas";
    this.ville = (structure && structure.ville) || "";
    this.departement = (structure && structure.departement) || "";
    this.codePostal = (structure && structure.codePostal) || "";
    this.region = (structure && structure.region) || "";
    this.agrement = (structure && structure.agrement) || "";
    this.telephone = (structure && structure.telephone) || {
      numero: "",
      countryCode: CountryISO.France,
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

    this.options = (structure && structure.options) || {
      numeroBoite: false,
    };

    this.sms = (structure && structure.sms) || {
      enabledByDomifa: true,
      enabledByStructure: false,
      senderName: "",
      senderDetails: "",
    };

    this.portailUsager = (structure && structure.portailUsager) || {
      enabledByDomifa: false,
      enabledByStructure: false,
      usagerLoginUpdateLastInteraction: false,
    };
  }
}
