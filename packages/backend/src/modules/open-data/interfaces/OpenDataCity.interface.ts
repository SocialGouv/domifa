import { AppEntity, PopulationSegmentEnum } from "@domifa/common";
import { Geometry } from "geojson";

export interface OpenDataCity extends AppEntity {
  regionCode: string;
  region: string;
  departmentCode: string;
  department: string;
  city: string;
  cityCode: string;
  postalCode: string;
  population: number;
  areas: Geometry;
  populationSegment: PopulationSegmentEnum;
}
