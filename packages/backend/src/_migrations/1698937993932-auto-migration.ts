import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1698937993932 implements MigrationInterface {
  name = "AutoMigration1698937993932";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_495b59d0dd15e43b262f2da8907"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_495b59d0dd15e43b262f2da8907" FOREIGN KEY ("interactionOutUUID") REFERENCES "interactions"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
