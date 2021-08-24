export type StatsTerritory = {
  [regionCode: string]: {
    x: number;
    y: number;
    cpt: number | string;
    regionName: string;
  };
};
