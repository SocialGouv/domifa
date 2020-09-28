import { INestApplication, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { of } from "rxjs";
import { Structure } from "../structures/structure-interface";
import { regions } from "../structures/regions.labels";
import { processUtil } from "../util/processUtil.service";
import { DepartementHelper } from "../structures/departement-helper.service";

const migrationName = __filename;

async function up(app: INestApplication) {
  Logger.debug(`[${migrationName}] UP`);
  await updateStructures({ app });
}

async function down(app: INestApplication) {
  Logger.debug(`[${migrationName}] DOWN`);
  // await of(undefined).toPromise();
}

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
    .exec(async (err: any, structures: Structure[]) => {
      if (err) {
        Logger.error(
          `[${migrationName}] error fetching structures to update`,
          err
        );
        throw err;
      }
      Logger.warn(
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
  // Logger.debug(`[${migrationName}] check structure "${structure._id}"`);

  const structureModel: Model<Structure> = app.get("STRUCTURE_MODEL");
  const departementHelper: DepartementHelper = app.get(DepartementHelper);

  const attributesToUpdate = rebuildRegionAndDepartement({
    departementHelper,
    structure,
  });

  if (Object.keys(attributesToUpdate).length === 0) {
    // Logger.debug(`[${migrationName}] nothing to update for "${structure._id}"`);

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
    Logger.error(
      `[${migrationName}] departement not found for postal code "${structure.codePostal}" for structure "${structure._id}"`
    );
  } else {
    if (departement !== structure.departement) {
      if (structure.departement && structure.departement.trim().length !== 0) {
        Logger.warn(
          `[${migrationName}] update departement from "${structure.departement}" to "${departement}" for structure "${structure._id}" with postal code "${structure.codePostal}"`
        );
      } else {
        Logger.warn(
          `[${migrationName}] set departement to "${departement}" for structure "${structure._id}" with postal code "${structure.codePostal}"`
        );
      }
      attributesToUpdate.departement = departement;
    }
    const region = regions[departement];

    if (!region) {
      Logger.error(
        `[${migrationName}] region not found for departement "${departement}" for structure "${structure._id}"`
      );
    } else {
      if (region.regionCode !== structure.region) {
        if (
          structure.region &&
          structure.region !== "ERREUR_REGION" &&
          structure.region.trim().length !== 0
        ) {
          Logger.warn(
            `[${migrationName}] update region from "${structure.region}" to "${region.regionCode}" for structure "${structure._id}" with departement "${departement}" and postal code "${structure.codePostal}"`
          );
        } else {
          Logger.warn(
            `[${migrationName}] set region from to "${region.regionCode}" for structure "${structure._id}" with departement "${departement}" and postal code "${structure.codePostal}"`
          );
        }
        attributesToUpdate.region = region.regionCode;
      }
    }
  }
  return attributesToUpdate;
}

export { up, down };
