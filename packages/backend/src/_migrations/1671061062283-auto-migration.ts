import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1671061062283 implements MigrationInterface {
  name = "autoMigration1671061062283";

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    } catch (e) {
      console.log("Update user_structure_security");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902" UNIQUE ("userId")`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
