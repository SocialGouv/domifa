import { RegionsLabels, DEPARTEMENTS_MAP } from ".";

export const REGIONS_SEO_URL_MAP: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce((acc, value) => {
  acc[value.regionCode] = value.regionId;
  return acc;
}, {} as unknown as RegionsLabels);

export const REGIONS_SEO_URL_TO_REGION_ID_MAP: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce((acc, value) => {
  acc[value.regionId] = value.regionCode;
  return acc;
}, {} as unknown as RegionsLabels);
