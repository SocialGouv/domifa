import { UsagerTable } from "./../database/entities/usager/UsagerTable.typeorm";
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { usagerLightRepository } from "../database/services/usager/usagerLightRepository.service";
import { getConnection, In, MigrationInterface, QueryRunner } from "typeorm";
import {
  interactionRepository,
  InteractionsTable,
  typeOrmSearch,
} from "../database";
import { appLogger } from "../util";
import {
  interactionsCreator,
  interactionsTypeManager,
} from "../interactions/services";

export class fixCorruptedUsagersMigration1641309834050
  implements MigrationInterface
{
  public async up(): Promise<void> {
    appLogger.warn(
      "[MIRATION] Correction des fiches aux mauvais nombres d'interactions"
    );

    // Partie 1 : on corrige les interactions négatives
    const usagersNegativeToUpdateQuery =
      await interactionRepository.findManyWithQuery({
        select: ["usagerUUID"],
        where: `"nbCourrier" < 0`,
      });

    const usagersNegativeToUpdate = [];
    usagersNegativeToUpdateQuery.map((item) => {
      if (usagersNegativeToUpdate.indexOf(item.usagerUUID) === -1) {
        usagersNegativeToUpdate.push(item.usagerUUID);
      }
    });

    // Partie 1: on modifie les interactions négatives
    appLogger.warn("[MIRATION] Inversion des valeurs négatives");

    // Création de la connexion pour la partie gérée par le QueryRunner (transactions qui doivent être release avant d'utiliser l'ORM)
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    // lets now open a new transaction:
    await queryRunner.startTransaction();

    const queryUpdate = await queryRunner.query(
      `UPDATE interactions SET "nbCourrier" = "nbCourrier" * -1, type='recommandeOut' where "nbCourrier" < 0 and type = 'recommandeIn'`
    );

    console.log(queryUpdate[1] + " interactions mises à jour");
    const queryUpdate2 = await queryRunner.query(
      `UPDATE interactions SET "nbCourrier" = "nbCourrier" * -1, type='courrierOut' where "nbCourrier" < 0 and type = 'courrierIn'`
    );
    console.log(queryUpdate2[1] + " interactions mises à jour");
    const queryUpdate3 = await queryRunner.query(
      `UPDATE interactions SET "nbCourrier" = "nbCourrier" * -1, type='colisOut' where "nbCourrier" < 0 and type = 'colisIn'`
    );
    console.log(queryUpdate3[1] + " interactions mises à jour");

    appLogger.warn(
      "[MIRATION] Cas particulier, on a une interaction sortante négative"
    );

    await queryRunner.query(
      `UPDATE interactions SET "nbCourrier" = 2 where "nbCourrier" = -3 and type = 'courrierOut'`
    );

    await queryRunner.commitTransaction();
    await queryRunner.release();

    // Partie 2 : on re-associe les distributions avec les bonnes interactions

    appLogger.warn(
      "[MIRATION] Réinitialisation des interactions des utilisateurs aux interactions corrompus"
    );
    await interactionRepository.updateMany(
      typeOrmSearch<InteractionsTable>({
        uuid: In(usagersNegativeToUpdate),
      }),
      {
        interactionOutUUID: null,
      }
    );

    appLogger.warn(
      "[MIRATION] Les interactions sortantes sont de nouveaux recalculés / associés aux bonnes interactions"
    );

    const usagersWithNegativeInteraction = await usagerLightRepository.findMany(
      typeOrmSearch<UsagerTable>({
        uuid: In(usagersNegativeToUpdate),
      }),
      {
        select: ["uuid", "structureId", "ref", "lastInteraction"],
        maxResults: 10000,
        order: { ref: "ASC" },
      }
    );

    console.log(usagersWithNegativeInteraction.length);

    for (const usager of usagersWithNegativeInteraction) {
      // On charge toutes les interactions de l'usager
      const usagerInteractions = await interactionRepository.findMany(
        typeOrmSearch<InteractionsTable>({
          usagerUUID: usager.uuid,
          type: In([
            "courrierIn",
            "colisIn",
            "recommandeIn",
            "courrierOut",
            "colisOut",
            "recommandeOut",
          ]),
          event: "create",
        }),
        {
          select: ["type", "uuid", "nbCourrier", "dateInteraction"],
          order: {
            dateInteraction: "ASC",
          },
          maxResults: 100000,
        }
      );

      if (!usagerInteractions || usagerInteractions.length === 0) {
        continue;
      }

      appLogger.warn(
        `[MIRATION] [${usager.uuid}] ${usagerInteractions.length} interactions à mettre à jour`
      );

      // Recalcul des interactions en stand-by
      const lastInteractionCalculated = {
        courrierIn: 0,
        colisIn: 0,
        recommandeIn: 0,
      };

      // Tableau des requêtes à éxecuter
      const tmpInteractions = {
        courrierIn: [],
        colisIn: [],
        recommandeIn: [],
      };

      for (const interaction of usagerInteractions) {
        // On vérifie s'il s'agit d'une interaction entrante (courrierIn, colisIn, recommandeIn)
        const direction = interactionsTypeManager.getDirection({
          type: interaction.type,
        });

        if (direction === "in") {
          // Ajout de l'interaction dans le tableau des interactions à mettre à jour : ajout de l'uuid de l'interaction sortante correspondante
          tmpInteractions[interaction.type].push(interaction.uuid.toString());
        }

        if (direction === "out") {
          // Mise à jour des interactions IN précédant cette distribution
          const oppositeType =
            interactionsTypeManager.getOppositeDirectionalType({
              type: interaction.type,
            });

          // Création de la requête d'update
          if (tmpInteractions[oppositeType].length > 0) {
            // Remise des tableaux à zéro
            lastInteractionCalculated[oppositeType] -= interaction.nbCourrier;

            await (
              await interactionRepository.typeorm()
            )
              .createQueryBuilder("interactions")
              .update()
              .set({ interactionOutUUID: interaction.uuid })
              .where({
                uuid: In(tmpInteractions[oppositeType]),
              })
              .execute();

            // Nettoyage du tableau des interactions entrantes
            tmpInteractions[oppositeType] = [];
          }
        }
      }
      // Fin de la boucle des interactions
      appLogger.warn(
        "[MIRATION] [" + usager.uuid + "] Mise à jour du compteur"
      );

      await interactionsCreator.updateUsagerAfterCreation({ usager });
    }
    // Fin de la boucle des usagers

    // Partie 3 : on corrige les compteurs négatifs
    const usagersWithNegativCounters =
      await usagerLightRepository.findManyWithQuery({
        select: ["uuid", "ref", "lastInteraction"],
        where: `("lastInteraction"->>'courrierIn')::integer < 0 OR ("lastInteraction"->>'recommandeIn' )::integer< 0 OR ("lastInteraction"->>'colisIn' )::integer< 0  `,
        order: {
          uuid: "ASC",
        },
      });

    for (const usager of usagersWithNegativCounters) {
      appLogger.warn(
        "[MIRATION] [" + usager.uuid + "] Mise à jour du compteur"
      );
      await interactionsCreator.updateUsagerAfterCreation({ usager });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
