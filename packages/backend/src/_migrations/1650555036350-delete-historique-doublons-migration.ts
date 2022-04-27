import { UsagerDecisionOrientation } from "./../_common/model/usager/UsagerDecisionOrientation.type";
import { UsagerDecisionMotif } from "./../_common/model/usager/UsagerDecisionMotif.type";
import { usagerRepository } from "./../database/services/usager/usagerRepository.service";
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { MigrationInterface, QueryRunner } from "typeorm";
import { Usager } from "../_common/model";

import { appLogger } from "../util";

import { setMilliseconds, setSeconds } from "date-fns";

export class deleteDoubloonsHistoriqueMigration1650555036350
  implements MigrationInterface
{
  name = "deleteDoubloonsHistoriqueMigration1650555036350";
  public async up(queryRunner: QueryRunner): Promise<void> {
    let totalDoublons = 0;
    let totalHistoriquesFail = 0;

    while ((await this.countToMigrate(queryRunner)) > 0) {
      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `select uuid, decision, historique FROM usager u
        WHERE u.migrated = false
        order by jsonb_array_length(u.historique) DESC
        LIMIT 5000`
      );

      for (const usager of usagers) {
        // Cas particuliers
        if (usager.historique.length === 0) {
          usager.historique.push(usager.decision);
        }

        // Si la décision n'existe pas encore dans l'historique, on l'ajoute
        if (
          usager.decision.statut !==
          usager.historique[usager.historique.length - 1].statut
        ) {
          usager.historique.push(usager.decision);
        }

        // Nouveau tableau d'historique
        let newHistorique = [];

        // Dernier statut rencontré
        let lastStatut = null;

        for (const decision of usager.historique) {
          // Date de référence pour l'index

          if (lastStatut === decision.statut) {
            // appLogger.debug(
            //   "[DOUBLON] " +
            //     decision.statut +
            //     " le " +
            //     decision.dateDecision +
            //     " \t Début :" +
            //     decision.dateDebut
            // );

            totalHistoriquesFail++;
          } else {
            decision.motif = this.cleanString(
              decision.motif
            ) as UsagerDecisionMotif;

            decision.motifDetails = this.cleanString(decision.motifDetails);

            decision.orientation = this.cleanString(
              decision.orientation
            ) as UsagerDecisionOrientation;

            decision.orientationDetails = this.cleanString(
              decision.orientationDetails
            );

            lastStatut = decision.statut;

            newHistorique.push(decision);
          }
        }

        // Tri du tableau
        newHistorique = newHistorique.sort((a, b) => {
          return (
            new Date(a.dateDecision).getTime() -
            new Date(b.dateDecision).getTime()
          );
        });

        if (newHistorique.length !== usager.historique.length) {
          totalDoublons++;
        }

        await (
          await usagerRepository.typeorm()
        ).update(
          { uuid: usager.uuid },
          {
            historique: newHistorique,
            migrated: true,
          }
        );
      }

      appLogger.warn("Dossiers en doublon : " + totalDoublons);
      appLogger.warn("Décision en doublon : " + totalHistoriquesFail);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}

  public resetDate = (value: Date) => {
    return setMilliseconds(setSeconds(new Date(value), 0), 0)
      .getTime()
      .toString();
  };

  public cleanString = (value: string) => {
    if (typeof value === "undefined" || !value) {
      return null;
    }

    if (value === "") {
      return null;
    }

    return value.toString().trim();
  };

  public async countToMigrate(queryRunner: QueryRunner): Promise<number> {
    const total = await queryRunner.query(`select COUNT (*) FROM usager u `);

    const count = await queryRunner.query(
      `select COUNT (*) FROM usager u WHERE u.migrated = false`
    );

    appLogger.warn(
      "[MIGRATION] " +
        count[0].count +
        " / " +
        total[0].count +
        " usagers à mettre à jour"
    );

    return count[0].count;
  }
}
