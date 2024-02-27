import { In, MigrationInterface, QueryRunner } from "typeorm";
import {
  interactionRepository,
  myDataSource,
  usagerRepository,
} from "../database";
import { INTERACTION_OK_LIST } from "../_common/model";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { appLogger } from "../util";
import { domifaConfig } from "../config";
import { TOULOUSE_STRUCTURE_ID } from "../_common/tmp-toulouse/TOULOUSE_STRUCTURE_ID.const";

export class UpdateLastInteractionMigration1700433996795
  implements MigrationInterface
{
  name = "UpdateLastInteractionMigration1700433996795";

  public async up(): Promise<void> {
    if (domifaConfig().envId !== "prod") {
      return;
    }

    const queryRunner = myDataSource.createQueryRunner();
    console.log("");
    appLogger.info("Mise à jour des dates de dernier passage 🏃‍♂️");
    console.log("");

    const total = await usagerRepository.countMigratedUsagers(
      TOULOUSE_STRUCTURE_ID
    );
    let cpt = 0;

    while (
      (await usagerRepository.countMigratedUsagers(TOULOUSE_STRUCTURE_ID)) > 0
    ) {
      console.log(
        `${cpt}/${total} dates de dernier passage à jour ${format(
          new Date(),
          "HH:mm:ss"
        )}`
      );
      const usagers = await usagerRepository.find({
        where: { structureId: TOULOUSE_STRUCTURE_ID, migrated: false },
        select: ["uuid", "ref", "lastInteraction", "decision"],
        take: 1000,
      });
      await queryRunner.startTransaction();

      for (const usager of usagers) {
        cpt++;

        const dateDebut = parseISO(
          usager.decision.dateDebut as unknown as string
        );

        if (typeof usager.lastInteraction.dateInteraction === "string") {
          usager.lastInteraction.dateInteraction = parseISO(
            usager.lastInteraction.dateInteraction
          );
        }

        const interaction = await interactionRepository.findOne({
          where: { type: In(INTERACTION_OK_LIST), usagerUUID: usager.uuid },
          select: {
            dateInteraction: true,
          },
          order: {
            dateInteraction: "DESC",
          },
        });

        if (interaction?.dateInteraction) {
          if (typeof interaction.dateInteraction === "string") {
            interaction.dateInteraction = parseISO(interaction.dateInteraction);
          }

          usager.lastInteraction.dateInteraction =
            differenceInCalendarDays(interaction.dateInteraction, dateDebut) > 0
              ? interaction.dateInteraction
              : dateDebut;
        } else if (
          !interaction?.dateInteraction &&
          !usager.lastInteraction.dateInteraction
        ) {
          usager.lastInteraction.dateInteraction = dateDebut;
        }

        await usagerRepository.update(
          { uuid: usager.uuid },
          {
            migrated: true,
            lastInteraction: usager.lastInteraction,
          }
        );
      }

      await queryRunner.commitTransaction();
    }
    console.log(
      `${cpt}/${total} dates de dernier passage à jour ${format(
        new Date(),
        "HH:mm:ss"
      )}`
    );
    await queryRunner.release();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
