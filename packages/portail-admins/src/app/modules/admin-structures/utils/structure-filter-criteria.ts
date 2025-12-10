import {
  CriteriaSearchField,
  DomiciliesSegmentEnum,
  Search,
  StructureType,
} from "@domifa/common";

export enum StructureFilterCriteriaSortEnum {
  ID = "id",
  NOM = "nom",
  TYPE = "structureType",
  CREATED_AT = "createdAt",
  IMPORT_AT = "importDate",
  USERS = "users",
  USAGERS = "usagers",
  ACTIFS = "actifs",
  LAST_LOGIN = "lastLogin",
  REGION = "regionName",
  DEPARTEMENT = "departementName",
}

export class StructureFilterCriteria extends Search {
  public reset: string;
  public searchStringField: CriteriaSearchField;
  // filters
  public structureType: StructureType;
  public region: string | number | null;
  public departement: string | null;
  public domicilieSegment: DomiciliesSegmentEnum | null;

  // order by
  public sortKey: StructureFilterCriteriaSortEnum;

  constructor(search?: Partial<StructureFilterCriteria> | null) {
    super(search);
    this.searchString = search?.searchString || null;
    this.searchStringField =
      search?.searchStringField || CriteriaSearchField.DEFAULT;
    this.structureType = search?.structureType || null;
    this.region = search?.region || null;
    this.departement = search?.departement || null;
    this.domicilieSegment = search?.domicilieSegment || null;
    this.page = search?.page || 1;
    this.sortKey = search?.sortKey || StructureFilterCriteriaSortEnum.ID;
    this.sortValue = search?.sortValue || "asc";
  }
}
