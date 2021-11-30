import { RegionsLabels, DEPARTEMENTS_MAP } from ".";

export const REGIONS_LABELS_MAP: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce((acc, value) => {
  acc[value.regionCode] = value.regionName;
  return acc;
}, {} as unknown as RegionsLabels);
