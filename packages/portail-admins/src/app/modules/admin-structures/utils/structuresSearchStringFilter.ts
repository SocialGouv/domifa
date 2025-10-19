import { buildWords, search, StructureType } from "@domifa/common";
import { StructureAdmin } from "../types";
import { StructureFilterCriteria } from "./structure-filter-criteria";

export const structuresSearchFilter = (
  structures: StructureAdmin[],
  structureFilterCriteria: StructureFilterCriteria
): StructureAdmin[] => {
  const { searchString, structureType, region, departement, domicilieSegment } =
    structureFilterCriteria;

  const filterKeys = [];
  if (structureType) {
    filterKeys.push("structureType");
  }
  if (region) {
    filterKeys.push("region");
  }
  if (departement) {
    filterKeys.push("departement");
  }
  if (domicilieSegment) {
    filterKeys.push("domicilieSegment");
  }

  const words = structureFilterCriteria.searchString
    ? buildWords(searchString)
    : [];

  const filterByProperty = (
    structure: StructureAdmin,
    key: keyof StructureAdmin,
    value: StructureType | string | number | null
  ): boolean => {
    return value === null || structure[key] === value;
  };

  return structures.filter((structure) => {
    if (
      filterKeys.length &&
      !filterKeys.every((key) =>
        filterByProperty(structure, key, structureFilterCriteria[key])
      )
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
