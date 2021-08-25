// constante dupliquée côté frontend
// https://fr.wikipedia.org/wiki/Liste_des_d%C3%A9partements_fran%C3%A7ais

import { REGIONS_DEF } from "./REGIONS_DEF.const";

const map: {
  [key: string]: {
    departmentName: string;
    regionCode: string;
    regionName: string;
    regionId: string;
  };
} = {};
export const DEPARTEMENTS_MAP = REGIONS_DEF.reduce((acc, region) => {
  region.departements.forEach((dep) => {
    acc[dep.departementCode] = {
      departmentName: dep.departementName,
      regionCode: region.regionCode,
      regionName: region.regionName,
      regionId: "guadeloupe",
    };
  });
  return acc;
}, map);
