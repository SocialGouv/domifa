import { buildWords, DomiciliesSegmentEnum, search } from "@domifa/common";
import { StructureAdmin } from "../../../types";
import { StructureFilterCriteria } from "../../../utils/structure-filter-criteria";

type StructureFilterParams = Pick<
  StructureFilterCriteria,
  "searchString" | "region" | "departement" | "type" | "usagersSegment"
>;

export const structuresSearchFilter = (
  structures: StructureAdmin[],
  structureFilterCriteria: StructureFilterCriteria
): StructureAdmin[] => {
  const { searchString, type, region, departement, usagersSegment } =
    structureFilterCriteria;
  const words = structureFilterCriteria.searchString
    ? buildWords(searchString)
    : [];

  const activeFilters = [
    ...(type ? [getTypeFilter(structureFilterCriteria)] : []),
    ...(region ? [getRegionFilter(structureFilterCriteria)] : []),
    ...(departement ? [getDepartmentFilter(structureFilterCriteria)] : []),
    ...(usagersSegment
      ? [getUsagersSegmentFilter(structureFilterCriteria)]
      : []),
  ];

  return structures.filter((structure) => {
    if (
      activeFilters.length &&
      !activeFilters.every((filter) => filter(structure))
    ) {
      return false;
    }

    const needsTextSearch = words.length > 0;
    if (!needsTextSearch) {
      return true;
    }

    const attributes = [
      `#${structure.id}`,
      structure.nom,
      structure.email,
      structure.region,
      structure.departement,
      structure.codePostal,
      structure.regionLabel,
      structure.departementLabel,
    ];

    return search.match(structure, {
      index: 0,
      getAttributes: () => attributes,
      words,
      withScore: false,
    }).match;
  });
};

const getTypeFilter =
  (structureFilterCriteria: StructureFilterParams) =>
  (structure: StructureAdmin): boolean =>
    structure.structureType === structureFilterCriteria.type;
const getRegionFilter =
  (structureFilterCriteria: StructureFilterParams) =>
  (structure: StructureAdmin): boolean =>
    structure.region === structureFilterCriteria.region;
const getDepartmentFilter =
  (structureFilterCriteria: StructureFilterParams) =>
  (structure: StructureAdmin): boolean =>
    structure.departement === structureFilterCriteria.departement;
const getUsagersSegmentFilter =
  (structureFilterCriteria: StructureFilterParams) =>
  (structure: StructureAdmin): boolean => {
    switch (DomiciliesSegmentEnum[structureFilterCriteria.usagersSegment]) {
      case DomiciliesSegmentEnum.VERY_SMALL:
        return structure.usagers < 10;
      case DomiciliesSegmentEnum.SMALL:
        return structure.usagers >= 10 && structure.usagers <= 499;
      case DomiciliesSegmentEnum.MEDIUM:
        return structure.usagers >= 500 && structure.usagers <= 1999;
      case DomiciliesSegmentEnum.LARGE:
        return structure.usagers >= 2000;
      default:
        return false;
    }
  };
