/* eslint-disable @typescript-eslint/no-unused-vars */
import { In, MigrationInterface, QueryRunner } from "typeorm";
import { structureRepository, usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager } from "../_common/model";
import {
  getDateFromInteraction,
  getDateFromUserLogin,
} from "../interactions/services/getLastInteractionDate.service";
import { differenceInCalendarDays, max } from "date-fns";

const QUERY = `decision->>'statut' = 'VALIDE'  AND migrated is false`;
const usagersUpdated = [];

export class FixLastInteractionMigration1703676787763
  implements MigrationInterface
{
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
        .getMany();

      await queryRunner.startTransaction();
      const uuidsToEdit = usagers.map((usager) => usager.uuid);

      console.log(cpt + "/" + total + " dossiers");

      for (const usager of usagers) {
        usager.lastInteraction.dateInteraction = new Date(
          usager.lastInteraction.dateInteraction
        );

        let dateInteractionOut = await getDateFromInteraction(usager, null);
        const dateLogin = await getDateFromUserLogin(
          usager,
          structuresMap[usager.structureId.toString()],
          null
        );

        if (dateInteractionOut && dateLogin) {
          dateInteractionOut = max([dateInteractionOut, dateLogin]);
        }

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
          const log = {
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
    //}
  }

  private async countMigration(): Promise<number> {
    return await usagerRepository.createQueryBuilder().where(QUERY).getCount();
  }
}
