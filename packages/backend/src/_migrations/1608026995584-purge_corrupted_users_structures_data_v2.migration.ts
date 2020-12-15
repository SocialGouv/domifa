import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import {
  appTypeormManager,
  AppUserTable,
  pgRepository,
  structureStatsRepository,
  USERS_USER_PROFILE_ATTRIBUTES,
} from "../database";
import { Structure } from "../structures/structure-interface";
import { appLogger } from "../util";
import { UserProfile } from "../_common/model";

export class manualMigration1608026995584 implements MigrationInterface {
  public name = "manualMigration1608026995584";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    const {
      structureModel,
      baseRepository,
      appUserRepository,
    }: {
      structureModel: Model<Structure, {}>;
      baseRepository;
      appUserRepository;
    } = await deleteOrphanStructures();

    // Récupérer le tableau des structures
    const structures = await structureModel
      .find()
      .select("id")
      .lean<Pick<Structure, "id">>()
      .exec();

    const idsOfStructures = structures.map((structure) => {
      return structure.id;
    });

    await deleteOrphanUsers(idsOfStructures);

    await deleteOrphanStats(idsOfStructures);

    async function deleteOrphanStructures() {
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
          verified: false,
          createdAt: {
            $gte: new Date("December 15, 2020 10:00:00"),
            $lte: new Date("December 15, 2020 20:00:00"),
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
      return { structureModel, baseRepository, appUserRepository };
    }

    async function deleteOrphanUsers(idsOfStructures: number[]) {
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

    async function deleteOrphanStats(idsOfStructures: number[]) {
      const oprhanStats = await structureStatsRepository.findManyWithQuery({
        select: ["uuid", "structureId"],
        where: `"structureId" NOT IN(:...ids)`,
        params: {
          ids: idsOfStructures,
        },
      });

      // Supprimer les stats qui ne sont pas associés à une structure
      appLogger.debug(
        `[Migration] [INFO] "${oprhanStats.length}" orphan stats`
      );

      let cpt = 1;
      for (const stats of oprhanStats) {
        await appUserRepository.delete({ uuid: stats.uuid });

        appLogger.debug(
          `[Migration] [INFO] "${cpt}"/"${oprhanStats.length}" deleted ofr structure ${stats.structureId}`
        );
        cpt++;
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
