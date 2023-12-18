import { STRUCTURE_TYPE_LABELS, Structure } from "@domifa/common";
import { StructureAdminForList } from "../../../../../../_common";
import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
} from "../../../../shared/territoires";

export const structuresListModelBuilder = { buildStructuresViewModel };

function buildStructuresViewModel(structures: StructureAdminForList[]) {
  return structures.map((structure: StructureAdminForList) => {
    return {
      ...structure,
      structureTypeLabel: STRUCTURE_TYPE_LABELS[structure.structureType],
      regionLabel: getRegionLabel(structure),
      departementLabel: getDepartementLabel(structure),
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
