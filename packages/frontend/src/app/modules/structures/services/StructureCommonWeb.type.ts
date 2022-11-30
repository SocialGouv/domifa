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
  public id: number;
  public createdAt: Date;
  public adresse: string;
  public complementAdresse: string;
  public nom: string;
  public structureType: StructureType;
  public ville: string;
  public departement: string;
  public region: string;
  public capacite: number | null;
  public codePostal: string;
  public agrement: string | null;
  public telephone: Telephone;
  public email: string;
  public timeZone: TimeZone;
  public responsable: StructureResponsable;
  public options: { numeroBoite: boolean };
  public adresseCourrier: StructureAddresseCourrier;
  public sms: StructureSmsParams;
  public portailUsager: StructurePortailUsagerParams;

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
