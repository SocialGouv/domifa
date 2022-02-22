import { RegionsLabels } from "../types";
import { DEPARTEMENTS_MAP } from "./DEPARTEMENTS_MAP.const";

// Récupérer l'ID à partir de la SEO url
export const REGIONS_ID_SEO: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce((acc, value) => {
  acc[value.regionCode] = value.regionId;
  return acc;
}, {} as unknown as RegionsLabels);

// Récupérer l'URL Seo à partir de l'ID
export const REGIONS_SEO_ID: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce((acc, value) => {
  acc[value.regionId] = value.regionCode;
  return acc;
}, {} as unknown as RegionsLabels);

console.log(REGIONS_ID_SEO);
