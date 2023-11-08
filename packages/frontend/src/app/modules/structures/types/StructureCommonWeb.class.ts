import { Telephone } from "../../../../_common/model";
import { TimeZone } from "../../../shared/territoires/types/TimeZone.type";

import { CountryISO } from "ngx-intl-tel-input";
import { StructureCommon } from "./StructureCommon.type";
import { StructurePortailUsagerParams } from "./StructurePortailUsagerParams.type";
import { StructureResponsable } from "./StructureResponsable.type";
import { StructureSmsParams } from "./StructureSmsParams.type";
import { StructureType, StructureAddresseCourrier } from "@domifa/common";

export class StructureCommonWeb implements StructureCommon {
  public id = 0;
  public createdAt: Date = new Date();
  public adresse = "";
  public complementAdresse = "";
  public nom = "";
  public structureType: StructureType = "ccas";
  public ville = "";
  public departement = "";
  public region = "";
  public capacite: number | null = 0;
  public codePostal = "";
  public agrement: string | null = "";
  public telephone: Telephone = {
    numero: "",
    countryCode: CountryISO.France,
  };
  public email = "";
  public timeZone: TimeZone = "Europe/Paris";
  public responsable: StructureResponsable = {
    fonction: "",
    nom: "",
    prenom: "",
  };
  public options: { numeroBoite: boolean } = { numeroBoite: false };
  public adresseCourrier: StructureAddresseCourrier = {
    actif: false,
    adresse: "",
    ville: "",
    codePostal: "",
  };
  public sms: StructureSmsParams = {
    enabledByDomifa: true,
    enabledByStructure: false,
    senderName: "",
    senderDetails: "",
  };
  public portailUsager: StructurePortailUsagerParams = {
    enabledByDomifa: false,
    enabledByStructure: false,
    usagerLoginUpdateLastInteraction: false,
  };
  public acceptTerms: Date | null = null;

  constructor(structure?: Partial<StructureCommon>) {
    if (structure) {
      this.id = structure.id || this.id;
      this.createdAt = structure.createdAt || this.createdAt;
      this.adresse = structure.adresse || this.adresse;
      this.complementAdresse =
        structure.complementAdresse || this.complementAdresse;
      this.nom = structure.nom || this.nom;
      this.structureType = structure.structureType || this.structureType;
      this.ville = structure.ville || this.ville;
      this.departement = structure.departement || this.departement;
      this.region = structure.region || this.region;
      this.capacite = structure.capacite || this.capacite;
      this.codePostal = structure.codePostal || this.codePostal;
      this.agrement = structure.agrement || this.agrement;
      this.telephone = structure.telephone || this.telephone;
      this.email = structure.email || this.email;
      this.timeZone = structure.timeZone || this.timeZone;
      this.responsable = structure.responsable || this.responsable;
      this.options = structure.options || this.options;
      this.adresseCourrier = structure.adresseCourrier || this.adresseCourrier;
      this.sms = structure.sms || this.sms;
      this.portailUsager = structure.portailUsager || this.portailUsager;
      this.acceptTerms = structure.acceptTerms || this.acceptTerms;
    }
  }
}
