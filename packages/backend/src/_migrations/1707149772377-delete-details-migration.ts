/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, Not, QueryRunner } from "typeorm";
import { usagerEntretienRepository } from "../database";
import { appLogger } from "../util";

export class DeleteEntretienDetailsMigration1707149772377
  implements MigrationInterface
{
  name = "DeleteEntretienDetailsMigration1707149772377";
  public async up(_queryRunner: QueryRunner): Promise<void> {
    appLogger.info(
      "[MIGRATION] Nettoyage des données inutiles dans l'entretien"
    );
    await usagerEntretienRepository.update(
      {
        liencommune: Not("AUTRE"),
      },
      { liencommuneDetail: null }
    );
    await usagerEntretienRepository.update(
      {
        residence: Not("AUTRE"),
      },
      { residenceDetail: null }
    );
    await usagerEntretienRepository.update(
      {
        cause: Not("AUTRE"),
      },
      { causeDetail: null }
    );
    await usagerEntretienRepository.update(
      {
        raison: Not("AUTRE"),
      },
      { raisonDetail: null }
    );
    await usagerEntretienRepository.update(
      {
        orientation: false,
      },
      { orientationDetail: null }
    );
    await usagerEntretienRepository.update(
      {
        accompagnement: false,
      },
      { accompagnementDetail: null }
    );
    await usagerEntretienRepository.update(
      {
        revenus: false,
      },
      { revenusDetail: null }
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
