import { MigrationInterface, QueryRunner } from "typeorm";

import { usagerRepository, userUsagerRepository } from "../database";

export class ManualMigration1684358283099 implements MigrationInterface {
  public async up(): Promise<void> {
    const message = "[MIGRATION] [BORDEAUX] ";
    console.log(message + "Suppression des comptes usagers de Bordeaux");

    await userUsagerRepository.delete({
      structureId: 201,
    });

    console.log(message + "Activation des sms pour les usagers de bordeaux");

    await usagerRepository
      .createQueryBuilder("usager")
      .update({
        contactByPhone: true,
      })
      .where(
        `telephone->>'numero' != '' and decision->>'statut' = :statut and "structureId" = :structureId `,
        { structureId: 201, statut: "VALIDE" }
      )
      .execute();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
