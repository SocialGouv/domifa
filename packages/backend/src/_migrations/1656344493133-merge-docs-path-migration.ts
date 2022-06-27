/* eslint-disable @typescript-eslint/no-unused-vars */
import { UsagerDocsTable } from "./../database/entities/usager/UsagerDocsTable.typeorm";
import { appLogger } from "./../util/AppLogger.service";
import { usagerRepository } from "../database/services/usager/usagerRepository.service";
import { Usager } from "../_common/model/usager/Usager.type";
import { MigrationInterface, QueryRunner } from "typeorm";

import { usagerDocsRepository } from "../database/services/usager/usagerDocsRepository.service";

export class mergeDocsMigration1656344493133 implements MigrationInterface {
  name = "mergeDocsMigration1656344493133";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] - Merge des documents start at " + new Date());

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
        const newDoc: UsagerDocsTable = {
          path: usager.docsPath[i],
          label: usager.docs[i].label,
          filetype: usager.docs[i].filetype,
          createdBy: usager.docs[i].createdBy,
          createdAt: usager.docs[i].createdAt,
          usagerUUID: usager.uuid,
          usagerRef: usager.ref,
          structureId: usager.structureId,
        };

        await (await usagerDocsRepository.typeorm()).save(newDoc);
      }

      cptMigration++;

      if (cptMigration % 500 === 0) {
        appLogger.debug(
          `[MIGRATE DOCS] ${cptMigration}/${usagers.length} migrés`
        );
      }

      appLogger.warn(
        "[MIGRATION] - Merge des documents finish at " + new Date()
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
