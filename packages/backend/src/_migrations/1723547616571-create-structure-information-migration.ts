import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class CreateStructureInformationMigration1723547616571
  implements MigrationInterface
{
  name = "CreateStructureInformationMigration1723547616571";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE "structure_information" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "title" character varying NOT NULL, "description" character varying, "isTemporary" boolean NOT NULL DEFAULT false, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "type" character varying NOT NULL, "createdBy" jsonb, "structureId" integer NOT NULL, CONSTRAINT "PK_b51c75b37769abf1fdf28fc89ef" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_17cd35c9fdcd9ab82015a46b22" ON "structure_information" ("structureId") `
      );
      await queryRunner.query(
        `ALTER TABLE "structure_information" ADD CONSTRAINT "FK_17cd35c9fdcd9ab82015a46b22c" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_information" DROP CONSTRAINT "FK_17cd35c9fdcd9ab82015a46b22c"`
    );

    await queryRunner.query(`DROP TABLE "structure_information"`);
  }
}
