import { RegionsLabels, DEPARTEMENTS_MAP } from ".";

export const REGIONS_SEO_URL_MAP: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce((acc, value) => {
  acc[value.regionCode] = value.regionId;
  return acc;
}, {} as unknown as RegionsLabels);
