import { appLogger } from "../../../../util";
import { Structure } from "../../../../_common/model";
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
    Pick<Structure, "id" | "email">
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

async function _anonymizeStructure(structure: Pick<Structure, "id" | "email">) {
  const attributesToUpdate: Partial<Structure> = {
    phone: null,
    telephone: {
      indicatif: "fr",
      numero: "",
    },
    sms: {
      enabledByDomifa: false,
      enabledByStructure: false,
      senderName: null,
      senderDetails: null,
    },
    email: dataEmailAnonymizer.anonymizeEmail({
      prefix: "structure",
      id: structure.id,
    }),
  };

  return structureRepository.updateOne(
    { id: structure.id },
    attributesToUpdate
  );
}
