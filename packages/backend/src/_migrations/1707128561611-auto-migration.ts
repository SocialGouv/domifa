import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFieldsInStructureMigration1707128561611
  implements MigrationInterface
{
  name = "CreateFieldsInStructureMigration1707128561611";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "departmentName" text`
    );
    await queryRunner.query(`ALTER TABLE "structure" ADD "regionName" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "regionName"`);
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "departmentName"`
    );
  }
}
