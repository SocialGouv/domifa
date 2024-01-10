/* eslint-disable @typescript-eslint/no-unused-vars */
import { differenceInCalendarDays } from "date-fns";
import { In, MigrationInterface, QueryRunner } from "typeorm";
import { Usager } from "../_common/model";
import { structureRepository, usagerRepository } from "../database";
import {
  getLastInteractionOut,
  getDateFromUserLogin,
} from "../interactions/services/getLastInteractionDate.service";
import { appLogger } from "../util";

const QUERY = `decision->>'statut' = 'VALIDE'  AND migrated is false`;
const usagersUpdated = [];
export class ManualMigration1704925488570 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.info(`[MIGRATION] nettoyage des dates de dernier passage`);

    let cpt = 0;
    const total = await this.countMigration();

    const structures = await structureRepository.find({
      select: ["uuid", "id", "nom", "portailUsager"],
    });

    const structuresMap = {};
    structures.forEach((structure) => {
      structuresMap[structure.id.toString()] = structure;
    });

    while ((await this.countMigration()) > 0) {
      appLogger.info(`${cpt}/${total} usagers`);

      const usagers: Usager[] = await usagerRepository
        .createQueryBuilder("usager")
        .where(QUERY)
        .limit(1000)
        .orderBy({ ref: "DESC" })
        .getMany();

      await queryRunner.startTransaction();
      const uuidsToEdit = usagers.map((usager) => usager.uuid);

      console.log(cpt + "/" + total + " dossiers");

      for (const usager of usagers) {
        usager.lastInteraction.dateInteraction = new Date(
          usager.lastInteraction.dateInteraction
        );

        const dateInteractionOut = await getLastInteractionOut(
          usager,
          structuresMap[usager.structureId.toString()]
        );

        if (
          dateInteractionOut &&
          differenceInCalendarDays(
            new Date(usager.lastInteraction.dateInteraction),
            dateInteractionOut
          ) !== 0 &&
          differenceInCalendarDays(
            dateInteractionOut,
            new Date(usager.decision.dateDebut)
          ) > 0
        ) {
          const dateLogin = await getDateFromUserLogin(
            usager,
            structuresMap[usager.structureId.toString()],
            null
          );

          const log = {
            uuid: usager.uuid,
            ref: usager.ref,
            structureId: usager.structureId,
            before: usager.lastInteraction.dateInteraction,
            after: dateInteractionOut,
            dateLogin,
            dateDebut: usager.decision.dateDebut,
            dateDiff: differenceInCalendarDays(
              new Date(usager.lastInteraction.dateInteraction),
              dateInteractionOut
            ),
          };

          usagersUpdated.push(log);

          await usagerRepository.update(
            { uuid: usager.uuid },
            {
              lastInteraction: {
                ...usager.lastInteraction,
                dateInteraction: dateInteractionOut,
              },

              migrated: true,
            }
          );

          console.log();
        }
      }
      cpt = cpt + 1000;

      await usagerRepository.update(
        { uuid: In(uuidsToEdit) },
        { migrated: true }
      );

      await queryRunner.commitTransaction();
    }
    console.log(usagersUpdated);
    console.log(usagersUpdated.length);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
  private async countMigration(): Promise<number> {
    return await usagerRepository.createQueryBuilder().where(QUERY).getCount();
  }
}
