import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager } from "../_common/model";

export class manualMigration1620800147708 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usagers: Pick<
      Usager,
      "uuid" | "decision" | "datePremiereDom"
    >[] = await usagerRepository.findManyWithQuery({
      select: ["uuid", "decision", "datePremiereDom"],
      where: `"datePremiereDom"  is null and decision->>'statut' = 'VALIDE'`,
    });

    const total = usagers.length;
    const i = 0;
    for (const usager of usagers) {
      appLogger.debug(
        `[Migration][FIX-DATE-PREMIERE-DOM] migrating ${i}/${total} usagers`
      );

      await usagerRepository.updateOne(
        { uuid: usager.uuid },
        { datePremiereDom: usager.decision.dateDebut }
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
