import { buildWords, Search, search } from "@domifa/common";
import { StructureAdmin } from "../../../types";

export const structuresSearchStringFilter = {
  filter,
};

function filter(
  structures: StructureAdmin[],
  { searchString }: Pick<Search, "searchString">
) {
  const words = searchString ? buildWords(searchString) : [];
  const needsTextSearch = words.length > 0;
  if (!needsTextSearch) {
    return structures;
  }

  return structures.filter((structure) => {
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
}
