import { Telephone } from "../../../../_common/model";

import { CountryISO } from "@khazii/ngx-intl-tel-input";

import {
  StructureType,
  StructureAddresseCourrier,
  StructurePortailUsagerParams,
  StructureResponsable,
  StructureSmsParams,
  StructureCommon,
  StructureOrganismeType,
  TimeZone,
  StructureRegistrationData,
  StructureOptions,
} from "@domifa/common";

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
  public organismeType: StructureOrganismeType | null = null;
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
  public options: StructureOptions = {
    numeroBoite: false,
    surnom: false,
    nomStructure: false,
  };

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
    schedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
    },
  };
  public portailUsager: StructurePortailUsagerParams = {
    enabledByDomifa: false,
    enabledByStructure: false,
    usagerLoginUpdateLastInteraction: false,
  };
  public acceptTerms: Date | null = null;
  public lastLogin: Date | null = null;
  public reseau: string | null = null;
  public siret: string | null = null;
  public registrationData?: StructureRegistrationData;

  constructor(structure?: Partial<StructureCommon>) {
    if (structure) {
      this.id = structure.id ?? this.id;
      this.createdAt = structure.createdAt ?? this.createdAt;
      this.adresse = structure.adresse ?? this.adresse;
      this.complementAdresse =
        structure.complementAdresse ?? this.complementAdresse;
      this.nom = structure.nom ?? this.nom;
      this.structureType = structure.structureType ?? this.structureType;
      this.ville = structure.ville ?? this.ville;
      this.departement = structure.departement ?? this.departement;
      this.region = structure.region ?? this.region;
      this.capacite = structure.capacite ?? this.capacite;
      this.codePostal = structure.codePostal ?? this.codePostal;
      this.agrement = structure.agrement ?? this.agrement;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.telephone = (structure.telephone as any) ?? this.telephone;
      this.email = structure.email ?? this.email;
      this.timeZone = structure.timeZone ?? this.timeZone;
      this.organismeType = structure.organismeType ?? this.organismeType;
      this.responsable = structure.responsable ?? this.responsable;
      this.options = structure.options ?? this.options;
      this.adresseCourrier = structure.adresseCourrier ?? this.adresseCourrier;
      this.sms = structure.sms ?? this.sms;
      this.portailUsager = structure.portailUsager ?? this.portailUsager;
      this.lastLogin = structure.lastLogin ?? this.lastLogin;
      this.reseau = structure.reseau ?? this.reseau;
      this.siret = structure?.siret ?? this.siret;
      this.registrationData =
        structure?.registrationData ?? this.registrationData;
    }
  }
}
