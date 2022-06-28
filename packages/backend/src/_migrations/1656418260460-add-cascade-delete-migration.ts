import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class addCascadeDeleteMigration1656418260460
  implements MigrationInterface
{
  name = "addCascadeDeleteMigration1656418260460";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure_doc" DROP CONSTRAINT "FK_d79d466c870df0b58864836899d"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" DROP CONSTRAINT "FK_a44d882d224e368efdee8eb8c80"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history" DROP CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history" DROP CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" DROP CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966"`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" DROP CONSTRAINT "FK_1953f5ad67157bada8774f7e245"`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" DROP CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager" DROP CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager" DROP CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" DROP CONSTRAINT "FK_a52dec7d55b4a81a0af01361485"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_0389a8aa8e69b2d17210745d040"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" DROP CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_b1db67565e53acec53d5f3aa926"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3"`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_066d08686fd781a7ea049b115a2"`
      );
      await queryRunner.query(
        `ALTER TABLE "structure_doc" ADD CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ADD CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" ADD CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" ADD CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" ADD CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager" ADD CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager" ADD CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" ADD CONSTRAINT "FK_a52dec7d55b4a81a0af01361485" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_0389a8aa8e69b2d17210745d040" FOREIGN KEY ("userId") REFERENCES "user_structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD CONSTRAINT "FK_57be1bdd772eb3fea1e201317e6" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES "user_usager"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_066d08686fd781a7ea049b115a2" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_b1db67565e53acec53d5f3aa926"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_066d08686fd781a7ea049b115a2"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP CONSTRAINT "FK_a52dec7d55b4a81a0af01361485"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" DROP CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" DROP CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP CONSTRAINT "FK_d79d466c870df0b58864836899d"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_1953f5ad67157bada8774f7e245"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history" DROP CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history" DROP CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" DROP CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" DROP CONSTRAINT "FK_a44d882d224e368efdee8eb8c80"`
    );

    await queryRunner.query(
      `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_b1db67565e53acec53d5f3aa926" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" ADD CONSTRAINT "FK_08c4299b8abc6b9f548f2aece20" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_066d08686fd781a7ea049b115a2" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" ADD CONSTRAINT "FK_0b7885e1594c7af3a5b84a4bdb3" FOREIGN KEY ("userId") REFERENCES "user_usager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD CONSTRAINT "FK_a52dec7d55b4a81a0af01361485" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" ADD CONSTRAINT "FK_0d31ec098c9d4e0507712b7f77c" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" ADD CONSTRAINT "FK_07ddbb376616a6bf4ffdbb2b6d7" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_doc" ADD CONSTRAINT "FK_d79d466c870df0b58864836899d" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_f9c3ee379ce68d4acfe4199a335" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_1953f5ad67157bada8774f7e245" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_options_history" ADD CONSTRAINT "FK_3cb5af09bf7cd68d7070dbc8966" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ADD CONSTRAINT "FK_a44d882d224e368efdee8eb8c80" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
