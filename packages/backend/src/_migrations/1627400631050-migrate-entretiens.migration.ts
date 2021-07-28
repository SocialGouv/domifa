import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerHistoryRepository, usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager } from "../_common/model";

export class manualMigration1627400631050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usagers: Pick<Usager, "uuid" | "entretien">[] =
      await usagerRepository.findManyWithQuery({
        select: ["uuid", "entretien"],
        where: "entretien->>'liencommune' is not null",
      });

    const total = usagers.length;
    let i = 0;

    appLogger.debug(`[Migration] UP manualMigration1620724704165`);

    for (const usager of usagers) {
      if (i++ % 100 === 0) {
        appLogger.debug(
          `[Migration][ENTRETIEN] migrating ${i}/${total} usagers`
        );
      }

      usager.entretien.liencommuneDetail = usager.entretien.liencommune;
      usager.entretien.liencommune = "AUTRE";

      await usagerRepository.updateOne(
        { uuid: usager.uuid },
        { entretien: usager.entretien }
      );

      const usagerStates = await usagerHistoryRepository.findOne({
        usagerUUID: usager.uuid,
      });

      const newStates = [];
      for (const state of usagerStates.states) {
        if (state?.entretien?.liencommune) {
          // console.log("LOG -  " + state.entretien.liencommune);
          state.entretien.liencommuneDetail = state.entretien.liencommune;
          state.entretien.liencommune = "AUTRE";
        }

        newStates.push(state);

        // console.log("");
        // console.log(" XXX ID A JOUR " + usager.uuid);
        await usagerHistoryRepository.updateOne(
          { uuid: usagerStates.uuid },
          { states: newStates }
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
