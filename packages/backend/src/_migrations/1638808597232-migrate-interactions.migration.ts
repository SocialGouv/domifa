import { UsagerLastInteractions } from "./../_common/model/usager/UsagerLastInteractions.type";
import { In, MigrationInterface, QueryRunner } from "typeorm";
import {
  interactionRepository,
  InteractionsTable,
  structureLightRepository,
  typeOrmSearch,
  usagerLightRepository,
} from "../database";

import { interactionsTypeManager } from "../interactions/services";
import { appLogger } from "../util";

export class migrateInteractions1638808597232 implements MigrationInterface {
  public name = "migrateInteractions1638808597232";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "usager" SET "interactionsMigrated" = false`
    );

    const INTERACTIONS_IN = ["courrierIn", "colisIn", "recommandeIn"];

    const structures = await structureLightRepository.findMany(
      {},
      {
        select: ["uuid", "id"],
        order: { id: "ASC" },
      }
    );

    for (const structure of structures) {
      // Affichage du compteur de suivi
      await displayCounter();

      // On charge tous les usagers de la structure
      const usagers = await usagerLightRepository.findMany(
        { structureId: structure.id, interactionsMigrated: false },
        {
          select: ["uuid", "structureId", "ref", "lastInteraction"],
          maxResults: 10000,
          order: { ref: "ASC" },
        }
      );

      appLogger.debug(
        `\n\n[STRUCTURE - ${structure.id}] ${usagers.length} USAGERS TO UPDATE\n`
      );

      // Usagers avec une erreur de comptage
      const updateUsagerWithCountError: {
        uuid: string;
        lastInteraction: UsagerLastInteractions;
      }[] = [];

      for (const usager of usagers) {
        // On charge toutes les interactions de l'usager
        const usagerInteractions = await interactionRepository.findMany(
          typeOrmSearch<InteractionsTable>({
            usagerRef: usager.ref,
            structureId: usager.structureId,
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
            // On additionne le nombre de courriers entrés
            lastInteractionCalculated[interaction.type] +=
              interaction.nbCourrier;

            // Ajout de l'interaction dans le tableau des interactions à mettre à jour : ajout de l'uuid de l'interaction sortante correspondante
            tmpInteractions[interaction.type].push(interaction.uuid.toString());
          }

          if (direction === "out") {
            // Mise à jour des interactions IN précédant cette distribution
            const oppositeType =
              interactionsTypeManager.getOppositeDirectionalType({
                type: interaction.type,
              });

            // FIX: toutes les interactions sortantes avant le 24/03/2020 sont corrompus, on corrige la donnée
            if (
              interaction.dateInteraction <
                new Date("2020-03-24T12:00:00.288Z") &&
              interaction.nbCourrier <= 1 &&
              interaction.nbCourrier !== lastInteractionCalculated[oppositeType]
            ) {
              appLogger.warn(
                `[${interaction.uuid}] [${interaction.type}] ❌ Enregistrés ${interaction.nbCourrier} VS ${lastInteractionCalculated[oppositeType]} Réels`
              );

              interaction.nbCourrier = lastInteractionCalculated[oppositeType];

              await interactionRepository.updateOne(
                { uuid: interaction.uuid },
                {
                  nbCourrier: interaction.nbCourrier,
                }
              );
            }

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

        // Variable de suivi des différences de calcul dans les courriers en attente
        let interactionsDifference = false;

        // On compare les courriers reçus réellement et le nombre de courriers en attente
        for (const interactionIn of INTERACTIONS_IN) {
          if (
            lastInteractionCalculated[interactionIn] !==
            usager.lastInteraction[interactionIn]
          ) {
            interactionsDifference = true;
            appLogger.warn(
              `[${usager.uuid}] [${interactionIn}] interaction ${lastInteractionCalculated[interactionIn]} / ${usager.lastInteraction[interactionIn]} - lastInteraction`
            );

            usager.lastInteraction[interactionIn] =
              lastInteractionCalculated[interactionIn];
          }
        }

        // Mise à jour de lastInteraction
        if (interactionsDifference) {
          usager.lastInteraction.enAttente =
            usager.lastInteraction.colisIn > 0 ||
            usager.lastInteraction.courrierIn > 0 ||
            usager.lastInteraction.recommandeIn > 0;

          // On met les infos dans un tableau pour éxécuter les requêtes à la fin
          updateUsagerWithCountError.push({
            uuid: usager.uuid.toString(),
            lastInteraction: usager.lastInteraction,
          });
        }
      }
      // Fin de la boucle sur l'usager

      // Mise à jour de l'usager pour indiquer qu'il a été migré
      await usagerLightRepository.updateMany(
        { structureId: structure.id },
        { interactionsMigrated: true }
      );

      // Mise à jour des usagers avec un souci de comptage
      if (updateUsagerWithCountError.length > 0) {
        for (const usagerToUpdate of updateUsagerWithCountError) {
          await usagerLightRepository.updateOne(
            { uuid: usagerToUpdate.uuid },
            {
              lastInteraction: usagerToUpdate.lastInteraction,
            }
          );
        }
      }
    }
    // Fin boucle structures
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(
      `[MIGRATION] Suppression des infos sur la migration des interactions`
    );

    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "interactionsMigrated"`
    );
  }
}

const displayCounter = async () => {
  const usagersToMigrate = await usagerLightRepository.count({
    where: {
      interactionsMigrated: false,
    },
  });

  const totalUsagers = await usagerLightRepository.count({});
  console.log();
  appLogger.debug(`-----------`);
  appLogger.debug(`[MIGRATION] ${usagersToMigrate} /  ${totalUsagers} usagers`);
  appLogger.debug(`-----------`);
  console.log();
};
