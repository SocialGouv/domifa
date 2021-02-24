import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class manualMigration1614164251906 implements MigrationInterface {
  name = "manualMigration1614164251906";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);
    await queryRunner.query(
      `update usager set "lastInteraction" = "lastInteraction" || '{"colisIn": 0}'::jsonb where "lastInteraction"->>'colisIn' is null;`
    );
    await queryRunner.query(
      `update usager set "lastInteraction" = "lastInteraction" || '{"courrierIn": 0}'::jsonb where "lastInteraction"->>'courrierIn' is null;`
    );
    await queryRunner.query(
      `update usager set "lastInteraction" = "lastInteraction" || '{"recommandeIn": 0}'::jsonb where "lastInteraction"->>'recommandeIn' is null;`
    );
    await queryRunner.query(
      `update usager set "lastInteraction" = "lastInteraction" || '{"enAttente": false}'::jsonb where "lastInteraction"->>'enAttente' is null;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
