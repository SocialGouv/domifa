import { RegionDef } from "../types";
import { DepartementInfos } from "../types/DepartementInfos.type";
// constante dupliquée côté frontend
// https://fr.wikipedia.org/wiki/Liste_des_d%C3%A9partements_fran%C3%A7ais

import { REGIONS_DEF } from "./REGIONS_DEF.const";

export const REGIONS_DOM_TOM = ["01", "02", "03", "04", "06"];
export const REGIONS_COM = ["NC", "PO", "SB", "SM", "SP", "WF", "TF"];

// Tout territoire hors métropole & Corse
export const REGIONS_OUTRE_MER = REGIONS_COM.concat(REGIONS_DOM_TOM);

export const DEPARTEMENTS_MAP: DepartementInfos = REGIONS_DEF.reduce(
  (acc, region: RegionDef) => {
    region.departements.forEach((dep) => {
      acc[dep.departementCode] = {
        departmentName: dep.departementName,
        regionCode: region.regionCode,
        regionName: region.regionName,
        regionId: region.regionId,
        timeZone: region.timeZone,
      };
    });
    return acc;
  },
  {}
);

export const DEPARTEMENTS_METROPOLE: DepartementInfos = REGIONS_DEF.reduce(
  (acc, region: RegionDef) => {
    region.departements.forEach((dep) => {
      if (
        !REGIONS_DOM_TOM.includes(region.regionCode) &&
        !REGIONS_COM.includes(region.regionCode)
      ) {
        acc[dep.departementCode] = {
          departmentName: dep.departementName,
          regionCode: region.regionCode,
          regionName: region.regionName,
          regionId: region.regionId,
          timeZone: region.timeZone,
        };
      }
    });
    return acc;
  },
  {}
);

export const DEPARTEMENTS_DOM_TOM: DepartementInfos = REGIONS_DEF.reduce(
  (acc, region: RegionDef) => {
    region.departements.forEach((dep) => {
      if (REGIONS_DOM_TOM.includes(region.regionCode)) {
        acc[dep.departementCode] = {
          departmentName: dep.departementName,
          regionCode: region.regionCode,
          regionName: region.regionName,
          regionId: region.regionId,
          timeZone: region.timeZone,
        };
      }
    });
    return acc;
  },
  {}
);

export const DEPARTEMENTS_COM: DepartementInfos = REGIONS_DEF.reduce(
  (acc, region: RegionDef) => {
    region.departements.forEach((dep) => {
      if (REGIONS_COM.includes(region.regionCode)) {
        acc[dep.departementCode] = {
          departmentName: dep.departementName,
          regionCode: region.regionCode,
          regionName: region.regionName,
          regionId: region.regionId,
          timeZone: region.timeZone,
        };
      }
    });
    return acc;
  },
  {}
);

console.log(DEPARTEMENTS_COM);
