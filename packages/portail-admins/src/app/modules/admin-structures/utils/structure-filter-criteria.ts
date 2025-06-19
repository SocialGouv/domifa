import {
  CriteriaSearchField,
  DomiciliesSegmentEnum,
  RegionDef,
  Search,
  StructureType,
} from "@domifa/common";
import { StructureAdmin } from '../types'

export enum StructureFilterCriteriaSortEnum {
  ID = 'id',
  NOM = 'nom',
  TYPE = 'structureTypeLabel',
  CREATED_AT = 'createdAt',
  IMPORT_AT = 'importDate',
  USERS = 'users',
  USAGERS = 'usagers',
  ACTIFS = 'actifs',
  LAST_LOGIN = 'lastLogin',
  REGION = 'regionLabel',
  DEPARTEMENT = 'departementLabel'
}

export type StructureFilterCriteriaSortKey =
  `${StructureFilterCriteriaSortEnum}`;

export class StructureFilterCriteria extends Search {
  public searchStringField: CriteriaSearchField;
  // filters
  public type: StructureType;
  public region: string | number | null
  public departement: string | null;
  public usagersSegment: DomiciliesSegmentEnum | null;
  

  // order by
  public sortKey: StructureFilterCriteriaSortKey;

  constructor(search?: Partial<StructureFilterCriteria> | null) {
    super(search);
    this.searchString = search?.searchString || null;
    this.searchStringField =
      search?.searchStringField || CriteriaSearchField.DEFAULT;
    this.type = search?.type || null;
    this.region = search?.region || null;
    this.departement = search?.departement || null;
    this.usagersSegment = search?.usagersSegment || null;
    this.page = search?.page || 1;
    this.sortKey = search?.sortKey || "id";
    this.sortValue = search?.sortValue || "asc";
  }
}

//@ts-ignore no-unused-vars
export const extractRegionsFilter = (allStructures: StructureAdmin[]): {
  regionName: Pick<RegionDef, 'regionName'>;
  regionCode: Pick<RegionDef, 'regionCode'>;
}[] => {
  // TODO extract all regions
  return []
}
//@ts-ignore no-unused-vars
export const extractDepartmentsFilter = (allStructures: StructureAdmin[], region?: Pick<RegionDef, 'regionCode'> ): {
  regionName: Pick<RegionDef, 'regionName'>;
  regionCode: Pick<RegionDef, 'regionCode'>;
}[] => {
  // extract all departments or only region departments
  return []
}
