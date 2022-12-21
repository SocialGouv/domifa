import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1671644721871 implements MigrationInterface {
  name = "autoMigration1671644721871";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "dev" || domifaConfig().envId === "test") {
      return;
    }
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "oldEntretien"`);

    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "UQ_aa19c17fc79f4e4a648643096f9" UNIQUE ("usagerUUID")`
    );

    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "UQ_5f4220e5a3e6d2ee1c1bb7fd3d2" UNIQUE ("structureId", "usagerRef")`
    );

    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "UQ_5f4220e5a3e6d2ee1c1bb7fd3d2"`
    );

    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP CONSTRAINT "UQ_aa19c17fc79f4e4a648643096f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" ADD CONSTRAINT "FK_aa19c17fc79f4e4a648643096f9" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(`ALTER TABLE "usager" ADD "oldEntretien" jsonb`);
  }
}
