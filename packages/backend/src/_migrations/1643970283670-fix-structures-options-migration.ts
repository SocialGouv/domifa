import { appLogger } from "./../util/AppLogger.service";
import { MigrationInterface, QueryRunner } from "typeorm";

import { structureRepository } from "../database";

export class manualMigration1643970283670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const structuresWithEmptyOptions = await (
      await structureRepository.typeorm()
    )
      .createQueryBuilder("structures")
      .select()
      .where(` "options" is NULL`)
      .execute();

    appLogger.debug(
      `[MIGRATION] ${structuresWithEmptyOptions.length} structures à mettre à jour`
    );

    const test = await (
      await structureRepository.typeorm()
    )
      .createQueryBuilder("structures")
      .update()
      .set({ options: { numeroBoite: false } })
      .where(` "options" is NULL`)
      .execute();

    console.log(test);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
