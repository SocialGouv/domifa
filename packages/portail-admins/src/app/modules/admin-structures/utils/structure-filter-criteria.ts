import {
  CriteriaSearchField,
  DEPARTEMENTS_LISTE,
  DomiciliesSegmentEnum,
  RegionDef,
  REGIONS_DEF,
  RegionsLabels,
  Search,
  StructureType,
} from "@domifa/common";

export enum StructureFilterCriteriaSortEnum {
  ID = "id",
  NOM = "nom",
  TYPE = "structureTypeLabel",
  CREATED_AT = "createdAt",
  IMPORT_AT = "importDate",
  USERS = "users",
  USAGERS = "usagers",
  ACTIFS = "actifs",
  LAST_LOGIN = "lastLogin",
  REGION = "regionLabel",
  DEPARTEMENT = "departementLabel",
}

export type StructureFilterCriteriaSortKey =
  `${StructureFilterCriteriaSortEnum}`;

export class StructureFilterCriteria extends Search {
  public reset: string;
  public searchStringField: CriteriaSearchField;
  // filters
  public type: StructureType;
  public region: string | number | null;
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

export const extractDepartmentsFilter = (region?: string): RegionsLabels => {
  if (!region) {
    return DEPARTEMENTS_LISTE;
  }
  return REGIONS_DEF.find(
    (r: RegionDef) => r.regionCode === region
  )?.departements.reduce<RegionsLabels>((acc, dep) => {
    acc[dep.departmentCode] = dep.departmentName;
    return acc;
  }, {});
};
