import { MigrationInterface, QueryRunner } from "typeorm";

export class resetPreferenceMigration1657059112531
  implements MigrationInterface
{
  name = "resetPreferenceMigration1657059112531";

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(
      "\n[MIGRATION] resetPreferenceMigration1657059112531 -  START\n"
    );

    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"contactByPhone": false, "telephone": {"countryCode": "fr", "numero": ""}}'`
    );

    await queryRunner.query(
      `UPDATE "usager" u set preference = '{"contactByPhone": false, "telephone": {"countryCode": "fr", "numero": ""}}'  where ("preference"->>'phone')::boolean is false`
    );

    await queryRunner.query(
      `UPDATE "usager" u set preference = '{"contactByPhone": false, "telephone": {"countryCode": "fr", "numero": ""}}'  where "preference" is null`
    );
    console.log("\n[MIGRATION] resetPreferenceMigration1657059112531 -  END\n");
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
