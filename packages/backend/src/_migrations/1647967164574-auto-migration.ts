import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1647967164574 implements MigrationInterface {
  name = "autoMigration1647967164574";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "telephone" jsonb DEFAULT '{"indicatif": "+33", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null, "telephone": null}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'`
    );
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "telephone"`);
  }
}
