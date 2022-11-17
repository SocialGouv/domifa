import { MigrationInterface, QueryRunner } from "typeorm";

import { Usager } from "../_common/model";
import { interactionsCreator } from "../interactions/services";

export class manualMigration1667855065591 implements MigrationInterface {
  name = "updateLastInteractionMigration1667855065591";
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Recompte des courriers en attente de tous les usagers
    const usagersToUpdate: Usager[] = await queryRunner.query(
      `select * from usager where "updatedAt" >= '2022-11-16'`
    );

    let i = 0;
    for (const usager of usagersToUpdate) {
      await interactionsCreator.updateUsagerAfterCreation({
        usager,
      });
      i++;
      console.log(
        i + " / " + usagersToUpdate.length + " usagers à mettre à jour"
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
