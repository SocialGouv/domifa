import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1622043150408 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE usager set "etapeDemande"=0 where "etapeDemande" = 5 and decision->>'statut' = 'ATTENTE_DECISION'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
