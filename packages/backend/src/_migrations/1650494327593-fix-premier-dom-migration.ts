/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager } from "../_common/model";

export class fixPremiereDomMigration1650494327593
  implements MigrationInterface
{
  name = "fixPremiereDomMigration1650494327593";

  public async up(): Promise<void> {
    appLogger.warn("[MIGRATION] Nettoyage de données obsolètes");
    const usagers: Usager[] = await (
      await usagerRepository.typeorm()
    ).query(
      `select * from usager u where decision->>'statut' = 'PREMIERE_DOM' OR decision->>'statut' = 'PREMIERE' OR decision->>'statut' = 'IMPORT'`
    );

    appLogger.warn(
      `[MIGRATION] [FIX PREMIERE_DOM] ${usagers.length} dossiers à mettre à jour`
    );
    // Correction des datas obsolètes de l'historique des premieres dom
    for (const usager of usagers) {
      usager.decision.statut = "VALIDE";

      await (
        await usagerRepository.typeorm()
      ).update(
        {
          uuid: usager.uuid,
        },
        {
          decision: usager.decision,
        }
      );
    }
  }

  public async down(): Promise<void> {}
}
