import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualMigration1693919222559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const docsToDelete = await queryRunner.query(
      `SELECT COUNT(uuid) FROM "usager_docs" where "encryptionContext" IS NULL`
    );

    console.log(docsToDelete[0]?.count + " docs to delete");
    await queryRunner.query(
      `DELETE FROM "usager_docs" where "encryptionContext" IS NULL`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Nothing
  }
}
