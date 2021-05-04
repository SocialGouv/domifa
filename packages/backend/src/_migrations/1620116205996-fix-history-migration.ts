import moment = require("moment");
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";
import { UsagerHistoryTable } from "../database/entities/usager/UsagerHistoryTable.typeorm";
import { uuidGenerator } from "../database/services/uuid";
import { usagerHistoryStateManager } from "../usagers/services/usagerHistoryStateManager.service";
import { usagerVisibleHistoryManager } from "../usagers/services/usagerVisibleHistoryManager.service";
import { appLogger } from "../util";
import {
  AppUserResume,
  Usager,
  UsagerDecision,
  UsagerHistory,
  UsagerHistoryState,
} from "../_common/model";

export class manualMigration1620116205996 implements MigrationInterface {
  name = "fix-history-migration-1620116205996";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration][${this.name}] UP`);

    await queryRunner.query(
      `CREATE TABLE "usager_history" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "import" jsonb, "states" jsonb NOT NULL, "decisions" jsonb NOT NULL, CONSTRAINT "UQ_7356ee08f3ac6e3e1c6fe08bd81" UNIQUE ("usagerUUID"), CONSTRAINT "UQ_29a873927e96c4290d288d594f4" UNIQUE ("structureId", "usagerRef"), CONSTRAINT "PK_29638b771d16000882db14bab40" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8" ON "usager_history" ("usagerUUID") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36a2e869faca3bb31cbacdf81b" ON "usager_history" ("structureId") `
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81" FOREIGN KEY ("usagerUUID") REFERENCES "usager"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history" ADD CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    const now = new Date();

    const usagers: Usager[] = await usagerRepository.findMany({});
    const usagersHistory: UsagerHistory[] = [];

    const total = usagers.length;
    let i = 0;
    for (const usager of usagers) {
      if (i++ % 10000 === 0) {
        appLogger.debug(
          `[Migration][${this.name}] migrating ${i}/${total} usagers history`
        );
      }
      const usagerHistory = processUsager(usager, now);
      usagersHistory.push(usagerHistory);
    }

    const chunkSize = 100;
    // save usagers by chunkSize
    for (let i = 0; i < total; i += chunkSize) {
      const toPersistNow = usagers.slice(i, i + chunkSize);
      appLogger.debug(
        `[Migration][${this.name}] persist ${
          i + toPersistNow.length
        }/${total} usagers`
      );
      await queryRunner.manager.save(toPersistNow);
    }

    // save usagers history by chunkSize
    for (let i = 0; i < total; i += chunkSize) {
      const toPersistNow = usagersHistory.slice(i, i + chunkSize);
      appLogger.debug(
        `[Migration][${this.name}] persist ${
          i + toPersistNow.length
        }/${total} usagers history`
      );
      await queryRunner.manager.save(toPersistNow);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_history" DROP CONSTRAINT "FK_36a2e869faca3bb31cbacdf81ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history" DROP CONSTRAINT "FK_7356ee08f3ac6e3e1c6fe08bd81"`
    );
    await queryRunner.query(`DROP INDEX "IDX_36a2e869faca3bb31cbacdf81b"`);
    await queryRunner.query(`DROP INDEX "IDX_7356ee08f3ac6e3e1c6fe08bd8"`);
    await queryRunner.query(`DROP TABLE "usager_history"`);
  }
}
function processUsager(usager: Usager, now: Date) {
  // add uuid to all decisions so we can identify them easily
  usager.historique.forEach((h) => {
    h.uuid = uuidGenerator.random();
  });
  usager.decision.uuid = uuidGenerator.random();
  // add decision to history
  usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

  const importHistory = usager.historique.find((d) => d.statut === "IMPORT");

  const realDecisions: UsagerDecision[] = usager.historique.filter(
    (d) => d.statut !== "IMPORT" && d.statut !== "PREMIERE_DOM"
  ) as any;

  const usagerHistory = new UsagerHistoryTable({
    usagerUUID: usager.uuid,
    structureId: usager.structureId,
    usagerRef: usager.ref,
    decisions: realDecisions,
    states: [],
    import:
      importHistory !== undefined
        ? {
            createdAt: importHistory.dateDecision,
            createdBy: {
              userId: importHistory.userId,
              userName: importHistory.userName,
            },
          }
        : undefined,
  });

  usagerHistory.states = realDecisions.map((decision) => {
    if (!decision.typeDom) {
      decision.typeDom = usager.typeDom;
    }
    if (!decision.dateDebut) {
      decision.dateDebut = decision.dateDecision;
    }
    const createdBy: AppUserResume = {
      userId: decision.userId,
      userName: decision.userName,
    };
    const newHistoryState: UsagerHistoryState = usagerHistoryStateManager.buildHistoryState(
      {
        usager: {
          decision,
          etapeDemande: undefined, // information perdue
          rdv: undefined, // information perdue
          typeDom: decision.typeDom, // information pas toujours présente, mais on la copie si elle existe
          entretien: usager.entretien, // information perdue, on copie l'entretien actuel (pour les stats)
          ayantsDroits: usager.ayantsDroits // information perdue, on copie les ayants droits actuels moins ceux n'étant pas nés au moment de la décision (pour les stats)
            .filter(
              (u) =>
                // filter out ayants droits born after decision date
                new Date(u.dateNaissance).getTime() >
                new Date(decision.dateDecision).getTime()
            ),
        },
        usagerHistory,
        createdAt: decision.dateDecision,
        createdBy,
        createdEvent: "new-decision",
        historyBeginDate: usagerHistoryStateManager.getHistoryBeginDate(
          decision.dateDebut ? decision.dateDebut : decision.dateDecision
        ),
      }
    );

    return newHistoryState;
  });

  // set history end dates
  usagerHistory.states.forEach((s, i) => {
    if (i !== 0) {
      // finish previous history state
      usagerHistory.states[
        i - 1
      ].historyEndDate = usagerHistoryStateManager.getHistoryEndDateFromNextBeginDate(
        s.historyBeginDate
      );
    }
  });

  // set history end dates
  usagerHistory.states.forEach((currentState, i) => {
    const previousState = i !== 0 ? usagerHistory.states[i - 1] : undefined;
    const nextState =
      i !== usagerHistory.states.length - 1
        ? usagerHistory.states[i + 1]
        : undefined;
    fixHistoryStateTypeDom({
      now,
      currentState,
      previousState,
      nextState,
      usager,
    });
  });
  return usagerHistory;
}

function fixHistoryStateTypeDom({
  now,
  currentState,
  previousState,
  nextState,
  usager,
}: {
  now: Date;
  currentState: UsagerHistoryState;
  previousState: UsagerHistoryState;
  nextState: UsagerHistoryState;
  usager: Usager;
}) {
  const decision = currentState.decision;

  if (!decision.typeDom) {
    if (usager.typeDom === "PREMIERE") {
      decision.typeDom = "PREMIERE";
    } else {
      if (
        decision.statut === "VALIDE" ||
        decision.statut === "INSTRUCTION" ||
        decision.statut === "ATTENTE_DECISION"
      ) {
        if (
          new Date(decision.dateDebut).getTime() <
            new Date(usager.datePremiereDom).getTime() ||
          Math.abs(
            new Date(decision.dateDebut).getTime() -
              new Date(usager.datePremiereDom).getTime()
          ) <
            (365 / 2) * 24 * 3600 * 1000
        ) {
          // date début  < 6 mois après la date de premier dom
          decision.typeDom = "PREMIERE";
        }
      }

      if (!decision.typeDom) {
        if (previousState) {
          // on regarde la décision précédente
          const previousDecision = previousState.decision;
          if (
            decision.statut === "INSTRUCTION" &&
            previousDecision.statut === "VALIDE"
          ) {
            // INSTRUCTION après VALIDE
            decision.typeDom = "RENOUVELLEMENT";
          } else if (
            decision.statut === "ATTENTE_DECISION" ||
            decision.statut === "RADIE" ||
            decision.statut === "INSTRUCTION" ||
            decision.statut === "REFUS"
          ) {
            // copie du typeDom précédent
            decision.typeDom = previousDecision.typeDom;
          }
        } else {
          // première décision
          if (decision.statut === "RADIE" || decision.statut === "REFUS") {
            // on n'a plus l'information, dans le doute on met RENOUVELLEMENT car ensuite, ça sera forcément un renouvellement
            decision.typeDom = "RENOUVELLEMENT";
          }
        }
        if (!decision.typeDom && nextState) {
          // on regarde la décision suivante
          const nextDecision = nextState.decision;
          if (nextDecision.typeDom === "PREMIERE") {
            // copie du typeDom suivant si PREMIERE
            decision.typeDom = nextDecision.typeDom;
          }
        }
        if (
          !decision.typeDom &&
          (decision.statut === "VALIDE" ||
            decision.statut === "INSTRUCTION" ||
            decision.statut === "ATTENTE_DECISION")
        ) {
          if (
            new Date(decision.dateDebut).getTime() <
              new Date(usager.datePremiereDom).getTime() ||
            Math.abs(
              new Date(decision.dateDebut).getTime() -
                new Date(usager.datePremiereDom).getTime()
            ) <
              365 * 24 * 3600 * 1000
          ) {
            // date début  < 1 an après la date de premier dom
            decision.typeDom = "PREMIERE";
          } else {
            // date début > 1 an après la date de premier dom
            decision.typeDom = "RENOUVELLEMENT";
          }
        }
      }
    }
  }
}
