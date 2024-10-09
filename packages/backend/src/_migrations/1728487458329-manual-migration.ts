import { IsNull, MigrationInterface } from "typeorm";
import { openDataPlaceRepository } from "../database";
import { getStructureType } from "../open-data-places/functions";
import { appLogger } from "../util";
import { domifaConfig } from "../config";

export class UpdateStructureTypeMigration1728487458329
  implements MigrationInterface
{
  name = "UpdateStructureTypeMigration1728487458329";
  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.info("[MIGRATION] Update structureType for OpenData");
      const places = await openDataPlaceRepository.find({
        where: {
          domifaStructureId: IsNull(),
        },
        select: ["nom", "uuid"],
      });

      for (const place of places) {
        await openDataPlaceRepository.update(
          { uuid: place.uuid },
          {
            structureType: getStructureType(place.nom),
          }
        );
      }
    }
  }

  public async down(): Promise<void> {
    //
  }
}
