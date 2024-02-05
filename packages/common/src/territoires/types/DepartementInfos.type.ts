import { type TimeZone } from "./TimeZone.type";

export type DepartementInfos = Record<
  string,
  {
    departmentName: string;
    regionCode: string;
    regionName: string;
    regionId: string;
    timeZone: TimeZone;
  }
>;
