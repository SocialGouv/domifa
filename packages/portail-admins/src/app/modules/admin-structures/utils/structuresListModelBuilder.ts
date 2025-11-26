import { STRUCTURE_TYPE_LABELS, StructureAdmin } from "@domifa/common";

export const structuresListModelBuilder = { buildStructuresViewModel };

function buildStructuresViewModel(structures: StructureAdmin[]) {
  return structures.map((structure: StructureAdmin) => {
    return {
      ...structure,
      structureTypeLabel: STRUCTURE_TYPE_LABELS[structure.structureType],
      users: parseInt(structure.users as unknown as string, 10),
      usagers: parseInt(structure.usagers as unknown as string, 10),
      actifs: parseInt(structure.actifs as unknown as string, 10),
    };
  });
}
