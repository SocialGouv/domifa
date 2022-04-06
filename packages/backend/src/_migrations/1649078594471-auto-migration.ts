import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1649078594471 implements MigrationInterface {
  name = "migration1649078594471";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "telephone" jsonb NOT NULL DEFAULT '{"indicatif": "+33", "numero": ""}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "telephone"`);
  }
}
