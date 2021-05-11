import { MigrationInterface, Not, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";

import { appLogger } from "../util";
import { Usager } from "../_common/model";

export class manualMigration1620724704165 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP manualMigration1620724704165`);

    const usagers: Pick<
      Usager,
      "uuid" | "ayantsDroits" | "structureId"
    >[] = await usagerRepository.findManyWithQuery({
      select: ["uuid", "ayantsDroits", "structureId"],
      where: 'jsonb_array_length("ayantsDroits") > 0;',
    });

    const total = usagers.length;
    let i = 0;
    for (const usager of usagers) {
      if (i++ % 10000 === 0) {
        appLogger.debug(
          `[Migration][Ayant-droits] migrating ${i}/${total} usagers`
        );
      }

      const defaultDate = new Date(Date.UTC(1900, 0, 1));

      usager.ayantsDroits.forEach((ayantDroit) => {
        const str = (ayantDroit.dateNaissance as any) as string;
        if (str.split) {
          const chunks = str.split("/");
          if (chunks.length === 3) {
            const years = parseInt(chunks[2], 10);
            const months = parseInt(chunks[1], 10);
            const days = parseInt(chunks[0], 10);
            if (years < 1900 || years > 2021) {
              appLogger.warn(
                `[Migration][fix-history-migration-1620116205996] invalid usager.dateNaissance "${str}" for usager ${usager.uuid} on structure ${usager.structureId}`
              );
              ayantDroit.dateNaissance = defaultDate;
            }
            ayantDroit.dateNaissance = new Date(
              Date.UTC(years, months - 1, days)
            );
          } else {
            ayantDroit.dateNaissance = defaultDate;
          }
        } else {
          ayantDroit.dateNaissance = defaultDate;
        }
      });

      await usagerRepository.updateOne(
        { uuid: usager.uuid },
        { ayantsDroits: usager.ayantsDroits }
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
