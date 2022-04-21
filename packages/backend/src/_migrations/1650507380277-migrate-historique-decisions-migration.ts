import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerHistoryRepository, usagerRepository } from "../database";

import { UsagerHistory, Usager, UsagerDecision } from "../_common/model";

export class migrateDecisionsMigration1650507380277
  implements MigrationInterface
{
  name = "migrateDecisionsMigration1650507380277";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      // const usagers: Usager[] = await (
      //   await usagerRepository.typeorm()
      // ).query(
      //   `select * from usager u where "datePremiereDom" IS null AND "typeDom" is  null`
      // );
      const usagersHistory: UsagerHistory[] = await (
        await usagerHistoryRepository.typeorm()
      ).query(
        `select "usagerUUID", states from  usager_history uh where EXISTS (
          SELECT TRUE
          FROM jsonb_array_elements(states) x
          WHERE x->>'createdEvent' IN ('delete-decision'))
          LIMIT 10`
      );

      const updated = [];
      const notUpdated = [];

      for (const usagerHistory of usagersHistory) {
        const mergedHistory: UsagerDecision[] = [];
        const usager: Usager = await (
          await usagerRepository.typeorm()
        ).findOne({ uuid: usagerHistory.usagerUUID });

        const historique = usagerHistory.states.filter(
          (state) => state.createdEvent === "new-decision"
        );

        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log(
          "UUID - " +
            usager.uuid +
            " structure id :" +
            usager.structureId +
            " usager ref " +
            usager.ref
        );
        console.log();

        for (const inStates of historique) {
          mergedHistory.push(inStates.decision);
        }
        console.log("HISTORIQUE EVENTS");
        console.table(mergedHistory);

        console.log("HISTORIQUE USAGER");
        console.table(usager.historique);
        for (const inStates of usager.historique) {
          mergedHistory.push(inStates);
        }

        mergedHistory.sort((a, b) => {
          const dateDecisionA = new Date(a.dateDecision);
          const dateDecisionB = new Date(b.dateDecision);
          return dateDecisionA.getTime() - dateDecisionB.getTime();
        });

        console.log(
          "USAGER HISTORIQUE FUSIONNÉ AVANT TRI- " + mergedHistory.length
        );
        mergedHistory.push(usager.decision);

        console.table(mergedHistory);

        console.log("AFTER");
        const unique = mergedHistory.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.dateDecision === value.dateDecision &&
                t.statut === value.statut
            )
        );

        mergedHistory.map((history: UsagerDecision) => {
          // Clean des motifs
          if (
            typeof history.motif === "undefined" ||
            (history.motif as string) === ""
          ) {
            history.motif = null;
          }
          // Clean des détails de motif
          if (
            typeof history.motifDetails === "undefined" ||
            (history.motifDetails as string) === ""
          ) {
            history.motifDetails = null;
          }

          // Clean des motifs
          if (
            typeof history.orientation === "undefined" ||
            (history.orientation as string) === ""
          ) {
            history.orientation = null;
          }
          // Clean des orientations
          if (
            typeof history.orientationDetails === "undefined" ||
            (history.orientationDetails as string) === ""
          ) {
            history.orientationDetails = null;
          }
          return history;
        });

        console.table(unique);

        // Recherche dans l'historique
      }
      throw new Error("ooppkpo");

      console.log(
        `${usagersHistory.length} = ${updated.length} + ${notUpdated.length}`
      );
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
