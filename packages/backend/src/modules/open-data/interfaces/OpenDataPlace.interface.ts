import {
  AppEntity,
  DomiciliesSegmentEnum,
  PopulationSegmentEnum,
  StructureType,
} from "@domifa/common";
import { Saturation } from "./providers/Saturation.type";
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
  software: "domifa" | "millesime" | "other" | "mss";
  domifaStructureId: number;
  dgcsId?: string | null;
  reseau?: string | null;
  mail: string | null;
  soliguideStructureId?: number;
  mssId?: string | null;
  structureType: StructureType | null;
  nbDomicilies?: number | null;
  nbDomiciliesDomifa?: number | null;
  domicilieSegment?: DomiciliesSegmentEnum;
  populationSegment?: PopulationSegmentEnum;
  nbAttestations?: number | null;
  nbAttestationsDomifa?: number | null;
  saturation?: Saturation;
  cityCode?: string | null;
  saturationDetails?: string | null;
}
