import { TimeZone } from "./TimeZone.type";
export type RegionDef = {
  regionCode: string;
  regionName: string;
  regionId: string;
  timeZone: TimeZone;
  departements: { departementCode: string; departementName: string }[];
};
