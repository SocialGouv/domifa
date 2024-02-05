import { type TimeZone } from "../types/TimeZone.type";
export interface RegionDef {
  regionCode: string;
  regionName: string;
  regionId: string;
  timeZone: TimeZone;
  departements: Array<{ departementCode: string; departementName: string }>;
}
