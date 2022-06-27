import { appLogger } from "./../util/AppLogger.service";
import { usagerRepository } from "../database/services/usager/usagerRepository.service";
import { Usager } from "../_common/model/usager/Usager.type";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class mergeDocsMigration1656343814368 implements MigrationInterface {
  name = "mergeDocsMigration1656343814368";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
        select uuid, docs, "docsPath", ref, "structureId"
        from usager u where jsonb_array_length(docs) > 0
      `
      );

      let cptMigration = 0;

      for (const usager of usagers) {
        for (let i = 0; i < usager.docs.length; i++) {
          usager.docs[i] = {
            ...usager.docs[i],
            path: usager.docsPath[i],
          };
        }

        await (
          await usagerRepository.typeorm()
        ).update(
          {
            uuid: usager.uuid,
          },
          {
            docs: usager.docs,
          }
        );

        cptMigration++;

        if (cptMigration % 100 === 0) {
          appLogger.debug(
            `[MIGRATE DOCS] ${cptMigration}/${usagers.length} migrés`
          );
        }
      }
    }
    throw new Error("TEST");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
