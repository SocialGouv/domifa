import { RegionsLabels } from "../types";
import { DEPARTEMENTS_MAP } from "./DEPARTEMENTS_MAP.const";

export const REGIONS_LABELS_MAP: RegionsLabels = Object.values(
  DEPARTEMENTS_MAP
).reduce((acc, value) => {
  acc[value.regionCode] = value.regionName;
  return acc;
}, {} as unknown as RegionsLabels);
