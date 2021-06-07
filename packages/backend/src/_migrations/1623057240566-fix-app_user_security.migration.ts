import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class manualMigration1623057240566 implements MigrationInterface {
  name = "manualMigration1623057240566";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP ${this.name}`);
    await queryRunner.query(
      `update app_user_security s set "structureId" = (select au."structureId" from app_user au where au.id = s."userId") where not exists
                (select from app_user u where s."userId"=u.id and s."structureId"=u."structureId")
        `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
