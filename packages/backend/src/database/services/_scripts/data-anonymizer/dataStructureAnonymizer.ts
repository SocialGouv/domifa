import { appLogger } from "../../../../util";

import { structureRepository } from "../../structure";
import { ANONYMIZE_STRUCTURE_ID_EXCEPTIONS } from "./ANONYMIZE_STRUCTURE_ID_EXCEPTIONS.const";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";
import { fakerFR as faker } from "@faker-js/faker";
import { structureDocRepository } from "../../structure-doc";
import { dataGenerator } from "./dataGenerator.service";
import { Structure } from "@domifa/common";

export const dataStructureAnonymizer = {
  isStructureToAnonymise,
  anonymizeStructures,
  anonymizeStructureDocs,
};

function isStructureToAnonymise(structure: Pick<Structure, "id">) {
  return !ANONYMIZE_STRUCTURE_ID_EXCEPTIONS.includes(structure.id); // ignore domifa team test structure;
}

async function anonymizeStructures() {
  const structures: Pick<Structure, "id" | "email" | "responsable">[] =
    await structureRepository.find({
      select: ["id", "email", "responsable"],
    });

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
  structure: Pick<Structure, "id" | "email" | "responsable">
) {
  const attributesToUpdate: Partial<Structure> = {
    telephone: {
      countryCode: "fr",
      numero: "0600000000",
    },
    email: dataEmailAnonymizer.anonymizeEmail({
      prefix: "structure",
      id: structure.id,
    }),
    token: null,
    tokenDelete: null,
    hardReset: null,
    responsable: {
      fonction: structure.responsable.fonction,
      nom: faker.person.lastName(),
      prenom: faker.person.firstName(),
    },
  };

  return structureRepository.update({ id: structure.id }, attributesToUpdate);
}

async function anonymizeStructureDocs() {
  await structureDocRepository.update(
    {},
    {
      label: faker.lorem.sentence(2),
      createdBy: {
        id: dataGenerator.number(),
        nom: dataGenerator.lastName(),
        prenom: dataGenerator.firstName(),
      },
    }
  );
}
