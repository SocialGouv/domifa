import { format } from "date-fns";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerRepository } from "../database";
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

      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `select * from usager u where "datePremiereDom" IS null AND "typeDom" is  null`
      );

      const updated = [];
      const notUpdated = [];

      for (const usager of usagers) {
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
        `${usagers.length} = ${updated.length} + ${notUpdated.length}`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
