import { MigrationInterface, QueryRunner } from "typeorm";

export class editIndexesFKMigration1654188388871 implements MigrationInterface {
  name = "editIndexesFKMigration1654188388871";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" DROP CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966"`
    );

    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" ADD CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_495b59d0dd15e43b262f2da8907" FOREIGN KEY ("interactionOutUUID") REFERENCES "interactions"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES "user_usager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_495b59d0dd15e43b262f2da8907"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" DROP CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "UQ_0b7885e1594c7af3a5b84a4bdb3" UNIQUE ("userId")`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES "user_usager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "UQ_cec1c2a0820383d2a4045b5f902" UNIQUE ("userId")`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" DROP CONSTRAINT "UQ_3cb5af09bf7cd68d7070dbc8966"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" ADD CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
