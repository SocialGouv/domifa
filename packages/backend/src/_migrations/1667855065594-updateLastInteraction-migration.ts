import { MigrationInterface, QueryRunner } from "typeorm";

import { Usager } from "../_common/model";
import { interactionsCreator } from "../interactions/services";

export class manualMigration1667855065594 implements MigrationInterface {
  name = "updateLastInteractionMigration1667855065594";
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Recompte des courriers en attente de tous les usagers
    const usagersToUpdate: Usager[] = await queryRunner.query(
      `select uuid, "lastInteraction" from usager where "updatedAt" >= '2022-11-16' LIMIT 5000`
    );

    let i = 0;
    for (const usager of usagersToUpdate) {
      await interactionsCreator.updateUsagerAfterCreation({
        usager,
      });
      i++;

      if (i % 100 === 0) {
        console.log(
          i + " / " + usagersToUpdate.length + " usagers à mettre à jour"
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
