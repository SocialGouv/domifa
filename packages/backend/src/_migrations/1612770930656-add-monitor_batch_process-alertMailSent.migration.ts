import {MigrationInterface, QueryRunner} from "typeorm";

export class autoMigration1612770930656 implements MigrationInterface {
    name = 'autoMigration1612770930656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "monitor_batch_process" ADD "alertMailSent" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "monitor_batch_process" DROP COLUMN "alertMailSent"`);
    }

}
