import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class CreateFieldsInStructureMigration1707128561611
  implements MigrationInterface
{
  name = "CreateFieldsInStructureMigration1707128561611";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "departmentName" text`
      );
      await queryRunner.query(`ALTER TABLE "structure" ADD "regionName" text`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "regionName"`);
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "departmentName"`
    );
  }
}
