import { INestApplication } from "@nestjs/common";
import { Model } from "mongoose";
import { Structure } from "../structures/structure-interface";
import { processUtil } from "../util/processUtil.service";
import { DepartementHelper } from "../structures/departement-helper.service";
import { appLogger } from "../util";

const migrationName = __filename;

async function up(app: INestApplication) {
  appLogger.debug(`[${migrationName}] UP`);
  await updateStructures({ app });
}

async function down(app: INestApplication) {
  appLogger.debug(`[${migrationName}] DOWN`);
  // await of(undefined).toPromise();
}

export const fixRegionsDepartementsMigration = {
  updateStructures,
};

async function updateStructures({
  app,
}: {
  app: INestApplication;
}): Promise<any> {
  const structureModel: Model<Structure> = app.get("STRUCTURE_MODEL");

  return structureModel
    .find({
      // $or: [{ region: { $exists: false } }, { region: "ERREUR_REGION" }],
    })
    .then((structures) => {
      appLogger.warn(
        `[${migrationName}] ${structures.length} structures to update`
      );
      if (structures.length === 0) {
        return;
      }

      return processUtil.processOneByOnePromise(structures, (structure) =>
        updateStructure(structure, { app })
      );
    });
}
async function updateStructure(
  structure: Structure,
  { app }: { app: INestApplication }
) {
  const structureModel: Model<Structure> = app.get("STRUCTURE_MODEL");
  const departementHelper: DepartementHelper = app.get(DepartementHelper);

  const attributesToUpdate = rebuildRegionAndDepartement({
    departementHelper,
    structure,
  });

  if (Object.keys(attributesToUpdate).length === 0) {
    return structure;
  }

  return structureModel
    .findOneAndUpdate({ _id: structure._id }, { $set: attributesToUpdate })
    .exec();
}

function rebuildRegionAndDepartement({
  departementHelper,
  structure,
}: {
  departementHelper: DepartementHelper;
  structure: Structure;
}): Partial<Pick<Structure, "departement" | "region">> {
  const attributesToUpdate: Partial<Pick<
    Structure,
    "departement" | "region"
  >> = {};

  const departement = departementHelper.getDepartementFromCodePostal(
    structure.codePostal
  );
  if (!departement) {
    appLogger.error(
      `[${migrationName}] departement not found for postal code "${structure.codePostal}" for structure "${structure._id}"`
    );
  } else {
    if (departement !== structure.departement) {
      if (structure.departement && structure.departement.trim().length !== 0) {
        appLogger.warn(
          `[${migrationName}] update departement from "${structure.departement}" to "${departement}" for structure "${structure._id}" with postal code "${structure.codePostal}"`
        );
      } else {
        appLogger.warn(
          `[${migrationName}] set departement to "${departement}" for structure "${structure._id}" with postal code "${structure.codePostal}"`
        );
      }
      attributesToUpdate.departement = departement;
    }
    const region = departementHelper.getRegionCodeFromDepartement(departement);

    if (!region) {
      appLogger.error(
        `[${migrationName}] region not found for departement "${departement}" for structure "${structure._id}"`
      );
    } else {
      if (region !== structure.region) {
        if (
          structure.region &&
          structure.region !== "ERREUR_REGION" &&
          structure.region.trim().length !== 0
        ) {
          appLogger.warn(
            `[${migrationName}] update region from "${structure.region}" to "${region}" for structure "${structure._id}" with departement "${departement}" and postal code "${structure.codePostal}"`
          );
        } else {
          appLogger.warn(
            `[${migrationName}] set region from to "${region}" for structure "${structure._id}" with departement "${departement}" and postal code "${structure.codePostal}"`
          );
        }
        attributesToUpdate.region = region;
      }
    }
  }
  return attributesToUpdate;
}

export { up, down };
