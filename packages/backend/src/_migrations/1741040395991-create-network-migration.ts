import { findNetwork } from "@domifa/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1741040395991 implements MigrationInterface {
  name = "AutoMigration1741040395991";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      const structures = await queryRunner.query(
        `SELECT id, nom FROM structure where "structureType"='asso'`
      );

      for (const structure of structures) {
        const reseau = findNetwork(structure.nom);
        await queryRunner.query(`UPDATE structure set reseau= $1 where id=$2`, [
          reseau,
          structure.id,
        ]);

        console.log(`Réseau assigné à la structure ${structure.nom}`);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
