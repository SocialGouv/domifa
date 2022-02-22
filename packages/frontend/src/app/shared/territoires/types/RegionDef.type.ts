export type RegionDef = {
  regionCode: string;
  regionName: string;
  regionId: string;
  timeZone: string;
  departements: { departementCode: string; departementName: string }[];
};
