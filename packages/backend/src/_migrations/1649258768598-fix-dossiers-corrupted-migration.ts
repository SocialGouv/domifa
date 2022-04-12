import { UsagerHistory } from "./../_common/model/usager/history/UsagerHistory.type";
import { format } from "date-fns";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerHistoryRepository, usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager } from "../_common/model";

export class fixCorruptedDossiersMigration1649258768598
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn(
        "[MIGRATION] Correction des dates de premières dom manquantes"
      );

      const usagersHistory: UsagerHistory[] = await (
        await usagerHistoryRepository.typeorm()
      ).query(
        `select "usagerUUID", states from  usager_history uh where EXISTS (
          SELECT TRUE
          FROM jsonb_array_elements(states) x
          WHERE x->>'createdEvent' IN ('delete-decision'))`
      );

      const updated = [];
      const notUpdated = [];

      for (const usagerHistory of usagersHistory) {
        const usager: Usager = await (
          await usagerRepository.typeorm()
        ).findOne({ uuid: usagerHistory.usagerUUID });
        let datePremiereDom = null;
        let typeDom = null;

        // Recherche dans l'historique

        for (const historique of usager.historique) {
          if (historique.dateDebut && historique.statut === "VALIDE") {
            if (!datePremiereDom) {
              datePremiereDom = new Date(historique.dateDebut);
            }
            if (!typeDom) {
              typeDom = historique.typeDom;
            }
          }
        }

        // Recherche dans la dernière décision
        if (usager.decision.dateDebut && usager.decision.statut === "VALIDE") {
          if (!datePremiereDom) {
            datePremiereDom = new Date(usager.decision.dateDebut);
          }
        }

        if (usager.decision.typeDom) {
          typeDom = usager.decision.typeDom;
        }

        datePremiereDom && typeDom
          ? updated.push(usager.uuid)
          : notUpdated.push(usager.uuid);

        appLogger.debug(
          `${usager.uuid} AVANT ${usager.datePremiereDom} - ${usager.typeDom}`
        );

        const dateToDisplay = datePremiereDom
          ? format(new Date(datePremiereDom), "dd/MM/yyyy à HH:mm")
          : "NULL";

        appLogger.debug(`${usager.uuid} APRES ${dateToDisplay} - ${typeDom}`);
        console.log();

        //
        // Mise à jour de l'usager
        await (
          await usagerRepository.typeorm()
        ).update(
          {
            uuid: usager.uuid,
          },
          {
            datePremiereDom,
            typeDom,
          }
        );
      }

      console.log(
        `${usagersHistory.length} = ${updated.length} + ${notUpdated.length}`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
