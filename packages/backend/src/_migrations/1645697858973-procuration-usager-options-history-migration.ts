import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";
import { usagerRepository } from "../database/services/usager/usagerRepository.service";
import { UsagerOptionsHistoryTable } from "../database/entities/usager/UsagerOptionsHistoryTable.typeorm";
import { usagerOptionsHistoryRepository } from "../database/services/usager/usagerOptionsHistoryRepository.service";
import { Usager } from "../_common/model";
import { appLogger } from "../util";

export class manualMigration1645697858973 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn(
        "[MIGRATION] Copie des données de l'historique des procurations"
      );

      const usagersWithProcuration: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
          SELECT uuid, options, "structureId"
          FROM usager
          WHERE options->'historique'->'procuration' != '[]'::jsonb
        `
      );

      for (const usager of usagersWithProcuration) {
        const newUsagerOptionsHistory = [];
        for (const procurationHistory of usager.options.historique
          .procuration) {
          newUsagerOptionsHistory.push(
            new UsagerOptionsHistoryTable({
              usagerUUID: usager.uuid,
              userId: null,
              userName: procurationHistory.user,
              structureId: usager.structureId,
              action: procurationHistory.action,
              type: "procuration",
              createdAt: new Date(procurationHistory.date),
              nom: procurationHistory?.content?.nom ?? null,
              prenom: procurationHistory?.content?.prenom ?? null,
              dateDebut: procurationHistory?.content?.dateDebut ?? null,
              dateFin: procurationHistory?.content?.dateFin ?? null,
              dateNaissance: procurationHistory?.content?.dateNaissance ?? null,
              adresse: null,
            })
          );
        }
        await usagerOptionsHistoryRepository.save(newUsagerOptionsHistory);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {}
}
