import { type AppEntity } from "../../_core";
import { type Telephone } from "../../telephone";
import { type TimeZone } from "../../territoires/types";

import { DomiciliesSegmentEnum, PopulationSegmentEnum } from "../enums";
import { StructureDecisionStatut, type StructureType } from "../types";
import { type StructureAddresseCourrier } from "./StructureAddresseCourrier.interface";
import { StructureDecision } from "./StructureDecision.interface";
import { type StructureOptions } from "./StructureOptions.interface";
import { type StructureOrganismeType } from "./StructureOrganismeType.type";
import { type StructurePortailUsagerParams } from "./StructurePortailUsagerParams.interface";
import { StructureRegistrationData } from "./StructureRegistrationData.interface";
import { type StructureResponsable } from "./StructureResponsable.interface";
import { type StructureSmsParams } from "./StructureSmsParams.interface";

export interface Structure extends AppEntity {
  id: number;
  adresse: string;
  complementAdresse: string;
  nom: string;
  structureType: StructureType;
  ville: string;
  departement: string;
  region: string;

  // Only for stats
  departmentName?: string;
  regionName?: string;
  cityCode?: string;

  capacite: number;
  codePostal: string;
  agrement: string;
  telephone: Telephone;
  email: string;
  import: boolean;
  registrationDate: Date;
  importDate: Date;
  lastLogin: Date;
  acceptTerms: Date | null;
  responsable: StructureResponsable;
  organismeType: StructureOrganismeType | null;
  hardReset: {
    token: string;
    expireAt?: Date;
  };

  adresseCourrier: StructureAddresseCourrier;
  options: StructureOptions;
  timeZone: TimeZone;
  sms: StructureSmsParams;
  portailUsager: StructurePortailUsagerParams;

  latitude: number;
  longitude: number;
  reseau?: string | null;
  domicilieSegment?: DomiciliesSegmentEnum | null;
  populationSegment?: PopulationSegmentEnum | null;
  registrationData?: StructureRegistrationData | null;
  siret: string | null;
  statut: StructureDecisionStatut;
  decision?: StructureDecision | null;
}
