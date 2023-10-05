import { AppEntity } from "@domifa/common";

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
  source: "soliguide" | "domifa" | "data-inclusion";
  uniqueId: string; // ID from soliguide | data-inclusion
  software: "domifa" | "millesime" | "other";
  structureId: number;
}
