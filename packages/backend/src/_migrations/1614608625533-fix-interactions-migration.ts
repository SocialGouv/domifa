import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1614608625533 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE interactions
            SET "usagerUUID"=u.uuid
            FROM (select uuid, ref, "structureId" from usager) AS u
            WHERE interactions."usagerRef" = u."ref" and interactions."structureId" = u."structureId";`
    );
    await queryRunner.query(
      `delete from interactions where not exists (select 1 from usager u where interactions."usagerRef" = u."ref" and interactions."structureId" = u."structureId");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
