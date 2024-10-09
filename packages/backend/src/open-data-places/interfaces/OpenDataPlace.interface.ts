import { AppEntity, StructureType } from "@domifa/common";

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
  source: "soliguide" | "domifa" | "data-inclusion" | "mss";
  uniqueId: string; // ID from soliguide | data-inclusion
  software: "domifa" | "millesime" | "other" | "mss";
  domifaStructureId: number;
  mail: string | null;
  soliguideStructureId: number;
  mssId: string | null;
  structureType: StructureType | null;
}
