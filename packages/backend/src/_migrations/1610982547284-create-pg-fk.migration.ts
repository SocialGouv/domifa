import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class autoMigration1610982547284 implements MigrationInterface {
  name = "autoMigration1610982547284";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);
    await queryRunner.query(
      `
          delete FROM interactions i where not exists 
          (select 1 from "structure" s where i."structureId" = s.id );
        `
    );
    await queryRunner.query(
      `
          delete FROM structure_stats i where not exists 
          (select 1 from "structure" s where i."structureId" = s.id );
        `
    );
    await queryRunner.query(
      `
         delete FROM app_user i where not exists 
         (select 1 from "structure" s where i."structureId" = s.id );
        `
    );
    await queryRunner.query(
      `
         delete FROM structure_doc i where not exists 
        (select 1 from "structure" s where i."structureId" = s.id );
        `
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "responsable" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "structure_stats" ADD CONSTRAINT "FK_32881a91eaf51f28d3f9cf09589" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD CONSTRAINT "FK_64204d3f209764ef8d08f334bd7" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_doc" ADD CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] DOWN "${this.name}"`);
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP CONSTRAINT "FK_d79d466c870df0b58864836899d"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP CONSTRAINT "FK_64204d3f209764ef8d08f334bd7"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_stats" DROP CONSTRAINT "FK_32881a91eaf51f28d3f9cf09589"`
    );

    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_1953f5ad67157bada8774f7e245"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "responsable" DROP NOT NULL`
    );
  }
}
