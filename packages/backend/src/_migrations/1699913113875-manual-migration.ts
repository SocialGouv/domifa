/* eslint-disable @typescript-eslint/no-unused-vars */
import { In, MigrationInterface, QueryRunner } from "typeorm";
import {
  UserUsagerLoginTable,
  interactionRepository,
  userUsagerLoginRepository,
} from "../database";

export class ManualMigration1699913113875 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    let i = 0;
    const total = await interactionRepository.countBy({
      type: "loginPortail" as any,
    });

    const batch = 25000;
    while (
      (await interactionRepository.countBy({ type: "loginPortail" as any })) > 0
    ) {
      const uuidsToDelete = [];
      const interactions = await interactionRepository.find({
        where: { type: "loginPortail" as any },
        take: batch,
        select: {
          dateInteraction: true,
          uuid: true,
          usagerUUID: true,
          structureId: true,
          updatedAt: true,
        },
      });

      await queryRunner.startTransaction();
      try {
        for (const interaction of interactions) {
          const userUsagerLogin = new UserUsagerLoginTable();
          userUsagerLogin.usagerUUID = interaction.usagerUUID;
          userUsagerLogin.structureId = interaction.structureId;
          userUsagerLogin.createdAt = interaction.dateInteraction;
          userUsagerLogin.updatedAt = interaction.updatedAt;
          await userUsagerLoginRepository.save(userUsagerLogin);
          uuidsToDelete.push(interaction.uuid);
        }

        await interactionRepository.delete({ uuid: In(uuidsToDelete) });
        await queryRunner.commitTransaction();
        i = i + batch;
        console.log(`${i}/${total} interactions migrated`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      }
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
