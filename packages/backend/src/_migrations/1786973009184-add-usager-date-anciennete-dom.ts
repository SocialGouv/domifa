import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

// dateAncienneteDom = la plus ancienne date de domiciliation connue pour cet
// usager, jamais modifiée une fois renseignée (contrairement à
// datePremiereDom qui, elle, repart de zéro après une radiation ou un refus
// de renouvellement - voir UsagersService.setDecision). Simple copie de la
// valeur actuelle de datePremiereDom au moment de la migration : cette
// dernière n'ayant jusqu'ici jamais été réinitialisée, elle correspond déjà
// à la date la plus ancienne connue pour chaque usager existant.
export class AddUsagerDateAncienneteDom1786973009184
  implements MigrationInterface
{
  name = "AddUsagerDateAncienneteDom1786973009184";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "dateAncienneteDom" timestamptz`
    );

    if (
      domifaConfig().envId !== "prod" &&
      domifaConfig().envId !== "preprod" &&
      domifaConfig().envId !== "local"
    ) {
      return;
    }

    const result = await queryRunner.query(
      `UPDATE "usager" SET "dateAncienneteDom" = "datePremiereDom"`
    );

    appLogger.warn(
      `[backfill dateAncienneteDom] ${
        result?.[1] ?? 0
      } usagers mis à jour (copie de datePremiereDom)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "dateAncienneteDom"`
    );
  }
}
