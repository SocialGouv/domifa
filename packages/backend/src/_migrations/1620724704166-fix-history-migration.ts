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

export class manualMigration1620724704166 implements MigrationInterface {
  name = "fix-history-migration-1620724704166";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration][${this.name}] UP`);

    await queryRunner.query(
      `ALTER TABLE "usager" ADD "import" jsonb DEFAULT null`
    );

    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "stats"`);
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{ "enabledByDomifa": false, "enabledByStructure": false, "senderName": null, "senderDetails": null }'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber":null}'`
    );

    await queryRunner.query(
      `CREATE TABLE "usager_history" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "usagerUUID" uuid NOT NULL, "usagerRef" integer NOT NULL, "structureId" integer NOT NULL, "import" jsonb, "states" jsonb NOT NULL, CONSTRAINT "UQ_7356ee08f3ac6e3e1c6fe08bd81" UNIQUE ("usagerUUID"), CONSTRAINT "UQ_29a873927e96c4290d288d594f4" UNIQUE ("structureId", "usagerRef"), CONSTRAINT "PK_29638b771d16000882db14bab40" PRIMARY KEY ("uuid"))`
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

    const usagers: Usager[] = await usagerRepository
      .getForMigration(queryRunner.manager)
      .findMany({});
    const usagersHistory: UsagerHistory[] = [];

    const total = usagers.length;
    let i = 0;
    for (const usager of usagers) {
      if (i++ % 10000 === 0) {
        appLogger.debug(
          `[Migration][${this.name}] migrating ${i}/${total} usagers history`
        );
      }
      const usagerHistory = await processUsager(usager, now, queryRunner);
      usagersHistory.push(usagerHistory);
    }
    const chunkSize = 1000;
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

    // throw new Error("temporary rollback");
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
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": false, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "stats" jsonb NOT NULL`
    );
  }
}

async function processUsager(
  usager: Usager,
  now: Date,
  queryRunner: QueryRunner
) {
  // add uuid to all decisions so we can identify them easily
  usager.historique.forEach((h) => {
    h.uuid = uuidGenerator.random();
  });
  // NOTE: le patch suivant va être repris dans un patch plus récent, sur master
  // usager.ayantsDroits.forEach((ayantDroit) => {
  //   const str = (ayantDroit.dateNaissance as any) as string;
  //   if (str.split) {
  //     const chunks = str.split("/");
  //     if (chunks.length === 3) {
  //       const years = parseInt(chunks[2], 10);
  //       const months = parseInt(chunks[1], 10);
  //       const days = parseInt(chunks[0], 10);
  //       if (years < 1900 || years > 2021) {
  //         appLogger.warn(
  //           `[Migration][fix-history-migration-1620116205996] invalid usager.dateNaissance "${str}" for usager ${usager.uuid} on structure ${usager.structureId}`
  //         );
  //       }
  //       ayantDroit.dateNaissance = new Date(Date.UTC(years, months - 1, days));
  //     }
  //   }
  // });
  usager.decision.uuid = uuidGenerator.random();

  // add decision to history
  usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

  usager.historique = usager.historique.reduce((acc, h) => {
    if (
      acc.find(
        (h2) =>
          h.statut === h2.statut &&
          h.dateDecision === h2.dateDecision &&
          h.userId === h2.userId &&
          h.userName === h2.userName &&
          h.dateDebut === h2.dateDebut &&
          h.dateFin === h2.dateFin
      ) === undefined
    ) {
      acc.push(h);
    } else {
      appLogger.warn(
        `[Migration] Remove duplicated history for usager ${usager.uuid}`
      );
    }
    return acc;
  }, [] as UsagerDecision[]);

  // Récupération de la date de premiere dom
  if (!usager.datePremiereDom) {
    const firstActiveDom = usager.historique.find((h) => h.statut === "VALIDE");
    if (firstActiveDom) {
      appLogger.warn(
        `[Migration] Fix date premiere dom usager ${usager.uuid} => ${firstActiveDom.dateDebut}`
      );
      usager.datePremiereDom = firstActiveDom.dateDebut;
    }
  }

  const importHistory = usager.historique.find((d) => d.statut === "IMPORT");

  // Récupération de l'historique sans import & premiere dom
  const realDecisions: UsagerDecision[] = usager.historique.filter(
    (d) =>
      d.statut !== "IMPORT" &&
      d.statut !== "PREMIERE_DOM" &&
      d.statut !== "PREMIERE"
  ) as any;

  // Ajout de l'import à l'objet usager
  let importData = null;

  if (!usager.import) {
    if (importHistory) {
      importData = {
        date: new Date(importHistory.dateDecision),
        userId: importHistory.userId,
        userName: importHistory.userName,
      };
    }
  }

  // Mise à jour de l'historique : suppression de premier dom, premiere et import
  const newHistorique = realDecisions.map((decision) => {
    if (!decision.dateDebut) {
      decision.dateDebut = decision.dateDecision;
    }
    return decision;
  });

  await usagerRepository
    .getForMigration(queryRunner.manager)
    .updateOne(
      { uuid: usager.uuid },
      { historique: newHistorique, import: importData }
    );

  //
  //
  //
  const usagerHistory = new UsagerHistoryTable({
    usagerUUID: usager.uuid,
    structureId: usager.structureId,
    usagerRef: usager.ref,
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
    // if (!decision.typeDom) {
    //   decision.typeDom = usager.typeDom;
    // }
    if (!decision.dateDebut) {
      decision.dateDebut = decision.dateDecision;
    }

    const createdBy: AppUserResume = {
      userId: decision.userId,
      userName: decision.userName,
    };

    const newHistoryState: UsagerHistoryState =
      usagerHistoryStateManager.buildHistoryState({
        usager: {
          decision,
          etapeDemande: undefined, // information perdue
          rdv: undefined, // information perdue
          typeDom: decision.typeDom, // information pas toujours présente, mais on la copie si elle existe
          entretien: usager.entretien, // information perdue, on copie l'entretien actuel (pour les stats)
          ayantsDroits: usager.ayantsDroits // information perdue, on copie les ayants droits actuels moins ceux n'étant pas nés au moment de la décision (pour les stats)
            .filter(
              (ad) =>
                // filter out ayants droits born after decision date
                new Date(ad.dateNaissance).getTime() <
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
      });

    if (
      newHistoryState.isActive !== true &&
      newHistoryState.isActive !== false
    ) {
      appLogger.error(`[Migration] Invalid history state ${usager.uuid}`, {
        extra: newHistoryState,
        sentry: false,
      });
      throw new Error("Invalid history state");
    }

    return newHistoryState;
  });

  // set history end dates
  usagerHistory.states.forEach((s, i) => {
    if (i !== 0) {
      // finish previous history state
      usagerHistory.states[i - 1].historyEndDate =
        usagerHistoryStateManager.getHistoryEndDateFromNextBeginDate(
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

  // fix historique typeDom from states
  usager.historique.forEach((h) => {
    if (!h.typeDom) {
      const typeDom = usagerHistory.states.find(
        (s) => s.decision.uuid === h.uuid
      )?.typeDom;
      h.typeDom = typeDom;
    }
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
    if (usager.typeDom === "PREMIERE_DOM") {
      decision.typeDom = "PREMIERE_DOM";
    } else {
      if (
        decision.statut === "VALIDE" ||
        decision.statut === "INSTRUCTION" ||
        decision.statut === "ATTENTE_DECISION"
      ) {
        if (
          new Date(decision.dateDebut).getTime() <=
            new Date(usager.datePremiereDom).getTime() ||
          Math.abs(
            new Date(decision.dateDebut).getTime() -
              new Date(usager.datePremiereDom).getTime()
          ) <
            (365 / 2) * 24 * 3600 * 1000
        ) {
          // date début  < 6 mois après la date de premier dom
          decision.typeDom = "PREMIERE_DOM";
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
          if (nextDecision.typeDom === "PREMIERE_DOM") {
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
            decision.typeDom = "PREMIERE_DOM";
          } else {
            // date début > 1 an après la date de premier dom
            decision.typeDom = "RENOUVELLEMENT";
          }
        }
      }
    }
  }
  currentState.typeDom = decision.typeDom;
}
