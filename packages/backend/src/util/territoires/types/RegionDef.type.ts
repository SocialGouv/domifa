import { FranceRegion } from "./FranceRegion.type";
import { TimeZone } from "./TimeZone.type";
export type RegionDef = {
  regionCode: FranceRegion;
  regionName: string;
  regionId: string;
  timeZone: TimeZone;
  departements: { departementCode: string; departementName: string }[];
};
