import { AdminStructureSListFilterSortAttribute } from "./AdminStructureSListFilterSortAttribute.type";

export type AdminStructureSListFilterCriteria = {
  // text search filter
  searchString?: string;
  // sort array
  sortAttribute: AdminStructureSListFilterSortAttribute;

  verified?: boolean;
};
