import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1763999725431 implements MigrationInterface {
  name = "AutoMigration1763999725431";

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "expired_token" DROP CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f"`
      );
    } catch (e) {
      console.log(e);
      console.log("No need to update");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expired_token" ADD CONSTRAINT "FK_728480a55bd9e5daa2a89d8de0f" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
