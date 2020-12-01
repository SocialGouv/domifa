import { INestApplication } from "@nestjs/common";
import { Model } from "mongoose";
import { Structure } from "../../../../structures/structure-interface";
import { appLogger } from "../../../../util";
import { ANONYMIZE_STRUCTURE_ID_EXCEPTIONS } from "./ANONYMIZE_STRUCTURE_ID_EXCEPTIONS.const";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";

export const dataStructureAnonymizer = {
  isStructureToAnonymise,
  anonymizeStructures,
};

function isStructureToAnonymise(structure: Pick<Structure, "id">) {
  return !ANONYMIZE_STRUCTURE_ID_EXCEPTIONS.includes(structure.id); // ignore domifa team test structure;
}

async function anonymizeStructures({ app }: { app: INestApplication }) {
  const structureModel: Model<Structure> = app.get("STRUCTURE_MODEL");
  const structures = await structureModel.find({}).select("id email");

  const structuresWithEmailsToAnonymize = structures.filter((x) =>
    isStructureToAnonymise(x)
  );

  appLogger.warn(
    `[dataStructureAnonymizer] ${structuresWithEmailsToAnonymize.length}/${structures.length} structures emails to anonymize`
  );
  for (const structure of structuresWithEmailsToAnonymize) {
    await _anonymizeStructure(structure, { app });
  }
}

async function _anonymizeStructure(
  structure: Structure,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataStructureAnonymizer] check structure "${structure._id}"`);

  const structureModel: Model<Structure> = app.get("STRUCTURE_MODEL");

  const attributesToUpdate: Partial<Structure> = {};

  if (dataEmailAnonymizer.isEmailToAnonymize(structure.email)) {
    attributesToUpdate.email = dataEmailAnonymizer.anonymizeEmail({
      prefix: "structure",
      id: structure.id,
    });
  }

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[dataStructureAnonymizer] nothing to update for "${structure._id}"`);

    return structure;
  }

  return structureModel.findOneAndUpdate(
    { _id: structure._id },
    { $set: attributesToUpdate }
  );
}
