import { MigrationInterface, QueryRunner } from "typeorm";
import { interactionRepository, usagerRepository } from "../database";
import { appLogger } from "../util";

export class ManualMigration1701788512483 implements MigrationInterface {
  public async up(): Promise<void> {
    appLogger.info("[MIGRATION] Update 'napi' for 'VALIDE' usagers");
    const usagers = await usagerRepository
      .createQueryBuilder("usager")
      .select("uuid, options, decision")
      .where(
        `(options->'npai'->>'actif')::boolean = true and decision->>'statut' = 'VALIDE'`
      )
      .getRawMany();

    for (const usager of usagers) {
      await usagerRepository.update(
        { uuid: usager.uuid },
        {
          options: {
            ...usager.options,
            npai: {
              actif: false,
              dateDebut: null,
            },
          },
        }
      );
    }

    appLogger.info("[MIGRATION] Delete npai from interactions ");
    await interactionRepository.delete({ type: "npai" as any });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
