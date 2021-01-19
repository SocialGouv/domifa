import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1606838472064 implements MigrationInterface {
  name = "autoMigration1606838472064";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" DROP DEFAULT`
    );

    await queryRunner.query(
      `ALTER TABLE public.log_batch_operation RENAME TO monitor_batch_process;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.monitor_batch_process RENAME TO log_batch_operation;`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" SET DEFAULT '2020-12-01 15:28:55.434139+00'`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" DROP NOT NULL`
    );
  }
}
