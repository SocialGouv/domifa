import { REGIONS_DEF } from "@domifa/common";
import { UserAdminAuthenticated } from "../../../_common/model";
import { MetabaseStatsDto } from "../dto";
const findRegionForDepartment = (departmentCode: string): string | null => {
  for (const region of REGIONS_DEF) {
    if (
      region.departements.some((dept) => dept.departmentCode === departmentCode)
    ) {
      return region.regionCode;
    }
  }
  return null;
};

export const checkTerritories = (
  user: UserAdminAuthenticated,
  metabaseDto: MetabaseStatsDto
): boolean => {
  if (user.role === "national" || user.role === "super-admin-domifa") {
    return true;
  }

  if (!user.territories || !user.territories.length) {
    return false;
  }

  if (user.role === "department") {
    const authorizedDepartments = user.territories.flat();

    if (metabaseDto.department) {
      return authorizedDepartments.includes(metabaseDto.department);
    }

    if (metabaseDto.region) {
      const regionDepartments =
        REGIONS_DEF.find((region) => region.regionCode === metabaseDto.region)
          ?.departements || [];

      return regionDepartments.some((dept) =>
        authorizedDepartments.includes(dept.departmentCode)
      );
    }

    return true;
  }

  if (user.role === "region") {
    const authorizedRegions = user.territories.flat();

    if (metabaseDto.region) {
      return authorizedRegions.includes(metabaseDto.region);
    }

    if (metabaseDto.department) {
      const departmentRegion = findRegionForDepartment(metabaseDto.department);
      if (!departmentRegion) {
        return false;
      }
      return authorizedRegions.includes(departmentRegion);
    }

    return true;
  }

  return false;
};
