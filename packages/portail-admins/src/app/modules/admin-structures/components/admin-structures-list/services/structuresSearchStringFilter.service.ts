import { buildWords, search } from "@domifa/common";
import { StructureAdmin } from "../../../types";
import { StructureFilterCriteria } from '../../../utils/structure-filter-criteria'

type StructureFilterParams = Pick<StructureFilterCriteria, 'searchString' | 'region' | 'departement' | 'type' | 'usagersSegment'>

export const structuresSearchFilter = (
    structures: StructureAdmin[],
  { searchString, departement, region, type, usagersSegment  }: StructureFilterParams
): StructureAdmin[] => {
  const words = searchString ? buildWords(searchString) : [];
  const needsTextSearch = words.length > 0;
  const textSearchFilteredStructures = needsTextSearch 
    ? [...structures].filter((structure) => {
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
  })
  : structures
  let filteredStructures = [...textSearchFilteredStructures]

  if (type) {
    filteredStructures = textSearchFilteredStructures.filter((structure) => {
      return structure.structureType === type
    })
  }
  if (departement) {
    filteredStructures = textSearchFilteredStructures.filter((structure) => {
      return structure.departement === departement
    })
  }

  if (region) {
    filteredStructures = textSearchFilteredStructures.filter((structure) => {
      return structure.region === region
    })
  }

  if (usagersSegment) {

  }
  
  return filteredStructures
} 
