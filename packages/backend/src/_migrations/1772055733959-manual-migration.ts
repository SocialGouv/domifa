/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";
import { usagerRepository } from "../database/services/usager/usagerRepository.service";
import { usagerHistoryStatesRepository } from "../database";
import { UsagerHistoryStates } from "../_common/model";

const STRUCTURE_ID = 1126;
const DRY_RUN = false;

const toDateKey = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  return new Date(date).toISOString().substring(0, 10); // YYYY-MM-DD
};

export class ManualMigration1772055733959 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(
      `[Migration] Début | structureId=${STRUCTURE_ID} | DRY_RUN=${DRY_RUN}`
    );

    // ─────────────────────────────────────────────────────────
    // Étape 0 — Comptage initial
    // ─────────────────────────────────────────────────────────
    const comptage: Array<{
      usagers_candidats: string;
      decisions_en_doublon: string;
    }> = await queryRunner.query(`
      SELECT
        COUNT(DISTINCT u.uuid) AS usagers_candidats,
        SUM(valides_consecutifs) AS decisions_en_doublon
      FROM (
        SELECT u.uuid, COUNT(*) AS valides_consecutifs
        FROM usager u
        CROSS JOIN generate_series(0, jsonb_array_length(u.historique::jsonb) - 2) AS i
        WHERE u."structureId" = ${STRUCTURE_ID}
          AND jsonb_array_length(u.historique::jsonb) > 2
          AND (u.historique::jsonb -> i ->> 'statut') = 'VALIDE'
          AND (u.historique::jsonb -> (i + 1) ->> 'statut') = 'VALIDE'
        GROUP BY u.uuid
      ) sub
      JOIN usager u ON u.uuid = sub.uuid
    `);

    const comptageHistoryStates: Array<{ lignes_history_states: string }> =
      await queryRunner.query(`
        SELECT COUNT(*) AS lignes_history_states
        FROM (
          SELECT "usagerUUID", DATE_TRUNC('second', "createdAt") AS seconde
          FROM usager_history_states
          WHERE "structureId" = ${STRUCTURE_ID}
            AND "createdEvent" = 'new-decision'
            AND (decision::jsonb->>'statut') = 'VALIDE'
          GROUP BY "usagerUUID", DATE_TRUNC('second', "createdAt")
          HAVING COUNT(*) > 1
        ) doublons
      `);

    console.log(`\n${"═".repeat(80)}`);
    console.log(`COMPTAGE INITIAL | structureId=${STRUCTURE_ID}`);
    console.log(
      `  Usagers candidats                  : ${comptage[0].usagers_candidats}`
    );
    console.log(
      `  Décisions en doublon (historique)  : ${comptage[0].decisions_en_doublon}`
    );
    console.log(
      `  Groupes en doublon (history_states): ${comptageHistoryStates[0].lignes_history_states}`
    );
    console.log(`${"═".repeat(80)}\n`);

    // ─────────────────────────────────────────────────────────
    // Chargement des usagers candidats
    // ─────────────────────────────────────────────────────────
    const usagers = await usagerRepository
      .createQueryBuilder("u")
      .select(["u.uuid", "u.ref", "u.structureId", "u.historique"])
      .where("u.structureId = :structureId", { structureId: STRUCTURE_ID })
      .andWhere("jsonb_array_length(u.historique::jsonb) > 2")
      .andWhere(
        `EXISTS (
        SELECT 1
        FROM generate_series(0, jsonb_array_length(u.historique::jsonb) - 2) AS i
        WHERE (u.historique::jsonb -> i ->> 'statut') = 'VALIDE'
          AND (u.historique::jsonb -> (i + 1) ->> 'statut') = 'VALIDE'
      )`
      )
      .getMany();

    let totalUsagersModifies = 0;
    let totalDecisionsSupprimees = 0;
    let totalHistoryStatesSupprimees = 0;

    // ─────────────────────────────────────────────────────────
    // Traitement usager par usager
    // ─────────────────────────────────────────────────────────
    for (const usager of usagers) {
      const historique = usager.historique;

      // ── Détection des doublons dans historique ────────────
      // historique[i] = VALIDE && historique[i+1] = VALIDE
      // avec même dateDebut et dateFin au jour près
      const uuidsASupprimer: string[] = [];

      for (let i = 0; i < historique.length - 1; i++) {
        const current = historique[i];
        const next = historique[i + 1];

        if (
          current.statut === "VALIDE" &&
          next.statut === "VALIDE" &&
          toDateKey(current.dateDebut) === toDateKey(next.dateDebut) &&
          toDateKey(current.dateFin) === toDateKey(next.dateFin)
        ) {
          console.log(
            `Doublon détecté pour usager ${usager.uuid} : ${current.uuid} et ${next.uuid}`
          );
          uuidsASupprimer.push(next.uuid);
        }
      }

      if (uuidsASupprimer.length === 0) continue;

      const historiquePurge = historique.filter(
        (d) => !uuidsASupprimer.includes(d.uuid)
      );

      if (!DRY_RUN) {
        await usagerRepository.update(
          { uuid: usager.uuid },
          { historique: historiquePurge as any }
        );
      }

      const allNewDecisions = (await usagerHistoryStatesRepository
        .createQueryBuilder("uhs")
        .select([
          "uhs.uuid",
          "uhs.createdAt",
          "uhs.decision",
          "uhs.createdEvent",
        ])
        .where(`uhs."usagerUUID" = :usagerUUID`, { usagerUUID: usager.uuid })
        .andWhere(`uhs."createdEvent" = 'new-decision'`)
        .orderBy(`uhs."createdAt"`, "ASC")
        .getMany()) as unknown as UsagerHistoryStates[];

      const historyStatesUuidsASupprimer: string[] = [];

      for (let i = 0; i < allNewDecisions.length - 1; i++) {
        const current = allNewDecisions[i];
        const next = allNewDecisions[i + 1];

        if (
          current.decision?.statut === "VALIDE" &&
          next.decision?.statut === "VALIDE" &&
          toDateKey(current.decision?.dateDebut) ===
            toDateKey(next.decision?.dateDebut) &&
          toDateKey(current.decision?.dateFin) ===
            toDateKey(next.decision?.dateFin)
        ) {
          // On garde next (plus récent), on supprime current (plus ancien)
          historyStatesUuidsASupprimer.push(current.uuid);
          console.log(
            `  [history_states] 🗑️  rowUuid=${current.uuid} | statut=${
              current.decision?.statut
            } | dateDebut=${toDateKey(
              current.decision?.dateDebut
            )} | createdAt=${new Date(current.createdAt).toISOString()}`
          );
        }
      }

      console.log(
        `  [history_states] ${historyStatesUuidsASupprimer.length} ligne(s) à supprimer`
      );

      if (!DRY_RUN && historyStatesUuidsASupprimer.length > 0) {
        await usagerHistoryStatesRepository
          .createQueryBuilder()
          .delete()
          .whereInIds(historyStatesUuidsASupprimer)
          .execute();
      }

      totalDecisionsSupprimees += uuidsASupprimer.length;
      totalHistoryStatesSupprimees += historyStatesUuidsASupprimer.length;
      totalUsagersModifies++;
    }

    // ─────────────────────────────────────────────────────────
    // Résumé final
    // ─────────────────────────────────────────────────────────
    console.log(`\n${"═".repeat(80)}`);
    console.log(
      `RÉSUMÉ FINAL | DRY_RUN=${DRY_RUN} | structureId=${STRUCTURE_ID}`
    );
    console.log(
      `  Usagers modifiés                   : ${totalUsagersModifies}`
    );
    console.log(
      `  Décisions retirées (historique)    : ${totalDecisionsSupprimees}`
    );
    console.log(
      `  Lignes supprimées (history_states) : ${totalHistoryStatesSupprimees}`
    );
    console.log(`${"═".repeat(80)}\n`);

    if (DRY_RUN) {
      appLogger.warn(
        "[Migration] DRY_RUN=true — aucune modification appliquée"
      );
    } else {
      appLogger.warn("[Migration] Modifications appliquées avec succès");
    }
    if (DRY_RUN) {
      throw new Error(
        "Fin de la migration - arrêter le processus pour éviter les modifications"
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Migration unidirectionnelle
  }
}
