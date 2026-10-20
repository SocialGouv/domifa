import { REGIONS_DEF } from "../../../territoires";

// Department codes covered by the given region codes (DREETS territories)
export const getRegionDepartmentCodes = (regionCodes: string[]): string[] =>
  REGIONS_DEF.filter((region) =>
    regionCodes.includes(region.regionCode)
  ).flatMap((region) => region.departements.map((dep) => dep.departmentCode));
