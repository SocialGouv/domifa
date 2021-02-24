import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1614194657232 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE public.usager set rdv=null where rdv = '{"userId": 0, "dateRdv": null, "userName": ""}';`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
