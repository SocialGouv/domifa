import { AppEntity, StructureType } from "@domifa/common";
import { Saturation } from "./Saturation.type";
import { OpenDataSource } from "./OpenDataSource.type";

export interface OpenDataPlace extends AppEntity {
  nom: string;
  adresse: string;
  complementAdresse: string;
  ville: string;
  codePostal: string;
  departement: string;
  region: string;
  latitude: number;
  longitude: number;
  source: OpenDataSource;
  uniqueId: string; // ID from soliguide | data-inclusion
  software: "domifa" | "millesime" | "other" | "mss";
  domifaStructureId: number;
  mail: string | null;
  soliguideStructureId?: number;
  mssId?: string | null;
  structureType: StructureType | null;
  nbDomicilies?: number | null;
  nbDomiciliesDomifa?: number | null;
  nbAttestations?: number | null;
  nbAttestationsDomifa?: number | null;
  saturation?: Saturation;
  saturationDetails?: string | null;
}
