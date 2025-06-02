import { AppEntity } from "@domifa/common";
import { Geometry } from "geojson";
import { PopulationSegmentEnum } from "../enums";

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
