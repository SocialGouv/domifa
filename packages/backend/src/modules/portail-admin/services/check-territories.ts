import { REGIONS_DEF } from "@domifa/common";
import { UserAdminAuthenticated } from "../../../_common/model";
import { MetabaseStatsDto } from "../dto";

export type ResolvedTerritoryFilter = {
  region: string[];
  department: string[];
};

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

// Returns the authoritative territory filter to apply (server forces user.territories
// for region/department roles), or null when the request is unauthorized.
export const resolveTerritoryFilter = (
  user: UserAdminAuthenticated,
  dto: MetabaseStatsDto
): ResolvedTerritoryFilter | null => {
  if (user.role === "national" || user.role === "super-admin-domifa") {
    return {
      region: dto.region ? [dto.region] : [],
      department: dto.department ? [dto.department] : [],
    };
  }

  if (!user.territories?.length) {
    return null;
  }

  const territories = user.territories.flat();

  if (user.role === "region") {
    if (dto.department) {
      const deptRegion = findRegionForDepartment(dto.department);
      if (!deptRegion || !territories.includes(deptRegion)) {
        return null;
      }
      return { region: [], department: [dto.department] };
    }
    if (dto.region) {
      if (!territories.includes(dto.region)) {
        return null;
      }
      return { region: [dto.region], department: [] };
    }
    return { region: territories, department: [] };
  }

  if (user.role === "department") {
    if (dto.department) {
      if (!territories.includes(dto.department)) {
        return null;
      }
      return { region: [], department: [dto.department] };
    }
    return { region: [], department: territories };
  }

  return null;
};

export const checkTerritories = (
  user: UserAdminAuthenticated,
  dto: MetabaseStatsDto
): boolean => resolveTerritoryFilter(user, dto) !== null;
