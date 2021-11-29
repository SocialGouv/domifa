import { Structure, StructureAdminForList } from "../../../../../../_common";
import { STRUCTURE_TYPE_LABELS } from "../../../../../../_common/usager/constants";
import {
  DEPARTMENTS_LABELS,
  REGIONS_LABELS_MAP,
} from "../../../../shared/constants";
import { AdminStructuresListStructureModel } from "../model";

export const structuresListModelBuilder = { buildStructuresViewModel };

function buildStructuresViewModel(structures: StructureAdminForList[]) {
  const structuresVM = structures.map((structure: StructureAdminForList) => {
    const structureVM: AdminStructuresListStructureModel = {
      ...structure,
      structureTypeLabel: STRUCTURE_TYPE_LABELS[structure.structureType],
      regionLabel: getRegionLabel(structure),
      departementLabel: getDepartementLabel(structure),
    };
    return structureVM;
  });

  return structuresVM;
}

function getRegionLabel(structure: Pick<Structure, "region">): string {
  const regionLabel = REGIONS_LABELS_MAP[structure.region];
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
  const departementLabel = DEPARTMENTS_LABELS[structure.departement];
  if (!departementLabel && structure.departement) {
    // eslint-disable-next-line no-console
    console.warn(
      `[AdminStructuresListStructureModel] departement ${structure.departement} not found.`
    );
  }
  return departementLabel;
}
