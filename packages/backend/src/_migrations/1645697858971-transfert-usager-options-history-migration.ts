import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";
import { usagerRepository } from "./../database/services/usager/usagerRepository.service";
import { UsagerOptionsHistoryTable } from "./../database/entities/usager/UsagerOptionsHistoryTable.typeorm";
import { usagerOptionsHistoryRepository } from "./../database/services/usager/usagerOptionsHistoryRepository.service";
import { Usager } from "../_common/model";

export class manualMigration1645697858971 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
        SELECT uuid, options
        FROM usager
        WHERE options->'historique'->'transfert' != '[]'::jsonb
        OR options->'historique'->'procuration' != '[]'::jsonb
      `
      );

      for (const usager of usagers) {
        for (const transfertHistory of usager.options.historique.transfert) {
          const newUsagerOptionsHistory = new UsagerOptionsHistoryTable({
            usagerUUID: usager.uuid,
            userId: null,
            userName: transfertHistory.user,
            structureId: usager.structureId,
            action: transfertHistory.action,
            type: "transfert",
            date: transfertHistory.date,
            nom: transfertHistory.content.nom,
            prenom: "",
            actif: transfertHistory.content.actif,
            dateDebut: transfertHistory.content.dateDebut,
            dateFin: transfertHistory.content.dateFin,
            dateNaissance: null,
            adresse: transfertHistory.content.adresse,
          });
          await usagerOptionsHistoryRepository.save(newUsagerOptionsHistory);
        }

        for (const procurationHistory of usager.options.historique
          .procuration) {
          const newUsagerOptionsHistory = new UsagerOptionsHistoryTable({
            usagerUUID: usager.uuid,
            userId: null,
            userName: procurationHistory.user,
            structureId: usager.structureId,
            action: procurationHistory.action,
            type: "procuration",
            date: procurationHistory.date,
            nom: procurationHistory.content.nom,
            prenom: procurationHistory.content.prenom,
            actif: procurationHistory.content.actif,
            dateDebut: procurationHistory.content.dateDebut,
            dateFin: procurationHistory.content.dateFin,
            dateNaissance: procurationHistory.content.dateNaissance,
            adresse: "",
          });

          await usagerOptionsHistoryRepository.save(newUsagerOptionsHistory);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
