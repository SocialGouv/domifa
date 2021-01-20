import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import {
  appTypeormManager,
  AppUserTable,
  pgRepository,
  USERS_USER_PROFILE_ATTRIBUTES,
} from "../database";
import { Structure } from "../structures/structure-interface";
import { appLogger } from "../util";
import { UserProfile } from "../_common/model";

export class manualMigration1608026995583 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const structureModel: Model<Structure> = appHolder.app.get(
      "STRUCTURE_MODEL"
    );

    const appUserRepository = appTypeormManager.getRepository(AppUserTable);
    const baseRepository = pgRepository.get<AppUserTable, UserProfile>(
      AppUserTable,
      {
        defaultSelect: USERS_USER_PROFILE_ATTRIBUTES,
      }
    );

    // Virer les anciennes structures
    const structuresToDelete = await structureModel
      .deleteMany({
        createdAt: {
          $gte: new Date("December 9, 2020 15:00:00"),
          $lte: new Date("December 14, 2020 19:00:00"),
        },
      })
      .exec();

    if (structuresToDelete && structuresToDelete !== null) {
      appLogger.debug(
        `[Migration] [SUCCESS] "${structuresToDelete.deletedCount}" deleted`
      );
    } else {
      appLogger.error(`[Migration] [FAILED] Delete impossible`);
    }

    // Récupérer le tableau des structures
    const structures = await structureModel.find().select("id").exec();

    const idsOfStructures = structures.map((structure: Structure) => {
      return structure.id;
    });

    const ghostUsers = await baseRepository.findManyWithQuery({
      select: USERS_USER_PROFILE_ATTRIBUTES.concat(["temporaryTokens"]),
      where: `"structureId" NOT IN(:...ids)`,
      params: {
        ids: idsOfStructures,
      },
    });

    // Supprimer les users qui ne sont pas associés à une structure
    appLogger.debug(`[Migration] [INFO] "${ghostUsers.length}" ghost users`);

    let cpt = 1;
    for (const user of ghostUsers) {
      await appUserRepository.delete({ email: user.email });

      appLogger.debug(
        `[Migration] [INFO] "${cpt}"/"${ghostUsers.length}" deleted`
      );
      cpt++;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
