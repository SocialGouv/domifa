/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";
import { Usager } from "../_common/model";

export class ManualMigration1696882900837 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const usagers: Usager[] = await usagerRepository
      .createQueryBuilder("usager")
      .select("*")
      .where(
        `(decision->>'dateFin' is null OR decision->>'dateDebut' is null) and decision->>'statut' not in ('INSTRUCTION', 'ATTENTE_DECISION')`
      )
      .getRawMany();

    for (const usager of usagers) {
      if (usager.decision.dateDebut && !usager.decision.dateFin) {
        usager.decision.dateFin = usager.decision.dateDebut;
      } else if (!usager.decision.dateDebut && usager.decision.dateFin) {
        usager.decision.dateDebut = usager.decision.dateFin;
      } else if (usager.decision.dateDecision) {
        usager.decision.dateFin = usager.decision.dateDecision;
        usager.decision.dateDebut = usager.decision.dateDecision;
      }
      if (!usager.decision.dateDecision) {
        usager.decision.dateDecision = usager.decision.dateDebut;
      }

      if (!usager.decision.dateDecision) {
        usager.decision.dateFin = usager.createdAt;
        usager.decision.dateDebut = usager.createdAt;
        usager.decision.dateDecision = usager.createdAt;
      }

      usager.historique[usager.historique.length - 1] = usager.decision;

      if (
        usager.decision.statut &&
        usager.decision.dateDebut &&
        usager.decision.dateFin
      ) {
        await usagerRepository.update(
          { uuid: usager.uuid },
          {
            decision: usager.decision,
            historique: usager.historique,
          }
        );
      }
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
