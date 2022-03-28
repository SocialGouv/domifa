import { TimeZone } from "./TimeZone.type";
export type DepartementInfos = {
  [key: string]: {
    departmentName: string;
    regionCode: string;
    regionName: string;
    regionId: string;
    timeZone: TimeZone;
  };
};
