import { type RegionDef } from "../interfaces";
import { type DepartementInfos, type RegionsLabels } from "../types";

import { REGIONS_DEF } from "./REGIONS_DEF.const";

// Départements et territoires d'outre mer
// 2 départements et régions d'outre-mer (DROM) : la Guadeloupe et La Réunion ;
// 3 collectivités uniques : la Collectivité Territoriale de Martinique, la Collectivité Territoriale de Guyane et le Département de Mayotte ;

export const REGIONS_DOM_TOM = ["01", "02", "03", "04", "06"];

// 7 collectivités d'outre-mer (COM) : la Nouvelle-Calédonie ;la Polynésie française ;Saint-Barthélemy ; Saint-Martin ; Saint-Pierre-et-Miquelon ;les Terres-australes-et-antarctiques-françaises et Wallis-et-Futuna.
export const REGIONS_COM = ["NC", "PO", "SB", "SM", "SP", "WF", "TF"];

// Tout territoire hors métropole & Corse
export const REGIONS_OUTRE_MER = REGIONS_COM.concat(REGIONS_DOM_TOM);

export const DEPARTEMENTS_MAP: DepartementInfos = REGIONS_DEF.reduce(
  (acc: DepartementInfos, region: RegionDef) => {
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

// Liste des départements : 93 => Seine-Saint-Denis
export const DEPARTEMENTS_LISTE: RegionsLabels =
  REGIONS_DEF.reduce<RegionsLabels>((acc, region: RegionDef) => {
    region.departements.forEach((dep) => {
      acc[dep.departementCode] = dep.departementName;
    });
    return acc;
  }, {});

// Départements de métropole
export const DEPARTEMENTS_METROPOLE: DepartementInfos = REGIONS_DEF.reduce(
  (acc: DepartementInfos, region: RegionDef) => {
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

// Départements et territoires d'outre mer
// 2 départements et régions d'outre-mer (DROM) : la Guadeloupe et La Réunion ;
// 3 collectivités uniques : la Collectivité Territoriale de Martinique, la Collectivité Territoriale de Guyane et le Département de Mayotte ;
export const DEPARTEMENTS_DOM_TOM: DepartementInfos = REGIONS_DEF.reduce(
  (acc: DepartementInfos, region: RegionDef) => {
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

// 7 collectivités d'outre-mer (COM) : la Nouvelle-Calédonie ;la Polynésie française ;Saint-Barthélemy ; Saint-Martin ; Saint-Pierre-et-Miquelon ;les Terres-australes-et-antarctiques-françaises et Wallis-et-Futuna.
export const DEPARTEMENTS_COM: DepartementInfos = REGIONS_DEF.reduce(
  (acc: DepartementInfos, region: RegionDef) => {
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

// Liste des régions
export const REGIONS_LISTE: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce<RegionsLabels>((acc, value) => {
  acc[value.regionCode] = value.regionName;
  return acc;
}, {});

// Récupérer l'ID à partir de la SEO url
export const REGIONS_ID_SEO: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce<RegionsLabels>((acc, value) => {
  acc[value.regionCode] = value.regionId;
  return acc;
}, {});

// Récupérer l'URL Seo à partir de l'ID
export const REGIONS_SEO_ID: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce<RegionsLabels>((acc, value) => {
  acc[value.regionId] = value.regionCode;
  return acc;
}, {});
