import { Structure } from "../../../../structures/structure-interface";
import { appLogger } from "../../../../util";
import { StructurePG } from "../../../../_common/model";
import { structureRepository } from "../../structure";
import { ANONYMIZE_STRUCTURE_ID_EXCEPTIONS } from "./ANONYMIZE_STRUCTURE_ID_EXCEPTIONS.const";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";

export const dataStructureAnonymizer = {
  isStructureToAnonymise,
  anonymizeStructures,
};

function isStructureToAnonymise(structure: Pick<Structure, "id">) {
  return !ANONYMIZE_STRUCTURE_ID_EXCEPTIONS.includes(structure.id); // ignore domifa team test structure;
}

async function anonymizeStructures() {
  const structures = await structureRepository.findMany<
    Pick<StructurePG, "id" | "email">
  >({}, { select: ["id", "email"] });

  const structuresWithEmailsToAnonymize = structures.filter((x) =>
    isStructureToAnonymise(x)
  );

  appLogger.warn(
    `[dataStructureAnonymizer] ${structuresWithEmailsToAnonymize.length}/${structures.length} structures to anonymize`
  );
  for (const structure of structuresWithEmailsToAnonymize) {
    await _anonymizeStructure(structure);
  }
}

async function _anonymizeStructure(
  structure: Pick<StructurePG, "id" | "email">
) {
  const attributesToUpdate: Partial<StructurePG> = {};

  structure.email = dataEmailAnonymizer.anonymizeEmail({
    prefix: "structure",
    id: structure.id,
  });

  if (Object.keys(attributesToUpdate).length === 0) {
    return structure;
  }

  return structureRepository.updateOne(
    { id: structure.id },
    attributesToUpdate
  );
}
