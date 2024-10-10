import {
  STRUCTURE_TYPE_LABELS,
  Structure,
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
} from "@domifa/common";
import { StructureAdmin } from "../../../types";

export const structuresListModelBuilder = { buildStructuresViewModel };

function buildStructuresViewModel(structures: StructureAdmin[]) {
  return structures.map((structure: StructureAdmin) => {
    return {
      ...structure,
      structureTypeLabel: STRUCTURE_TYPE_LABELS[structure.structureType],
      regionLabel: getRegionLabel(structure),
      departementLabel: getDepartementLabel(structure),
      users: parseInt(structure.users as unknown as string, 10),
      usagers: parseInt(structure.usagers as unknown as string, 10),
    };
  });
}

function getRegionLabel(structure: Pick<Structure, "region">): string {
  const regionLabel = REGIONS_LISTE[structure.region];
  if (!regionLabel && structure.region) {
    // eslint-disable-next-line no-console
    console.warn(
      `[AdminStructuresListStructureModel] region ${structure.region} not found.`
    );
  }
  return regionLabel;
}

function getDepartementLabel(
  structure: Pick<Structure, "departement">
): string {
  const departementLabel = DEPARTEMENTS_LISTE[structure.departement];
  if (!departementLabel && structure.departement) {
    // eslint-disable-next-line no-console
    console.warn(
      `[AdminStructuresListStructureModel] departement ${structure.departement} not found.`
    );
  }
  return departementLabel;
}
