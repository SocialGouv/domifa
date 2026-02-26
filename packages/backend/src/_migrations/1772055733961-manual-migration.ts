/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";
import { UsagerDecision } from "@domifa/common";
import { UsagerHistoryStates } from "../_common/model";
import { usagerRepository, usagerHistoryStatesRepository } from "../database";

const DRY_RUN = false;
const DATE_BUG = "2025-02-25"; // Jour du déploiement bugué

export class FixDateFinValideMigration1772055733961
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(
      `[Migration] Début | DRY_RUN=${DRY_RUN} | date_bug=${DATE_BUG}`
    );

    // ─────────────────────────────────────────────────────────
    // Étape 0 — Comptage initial : cas du jour du bug seulement
    // ─────────────────────────────────────────────────────────
    const comptageBug: Array<{
      usagers_touches: string;
      structures_touchees: string;
    }> = await queryRunner.query(`
      SELECT
        COUNT(*) AS usagers_touches,
        COUNT(DISTINCT "structureId") AS structures_touchees
      FROM usager
      WHERE statut = 'VALIDE'
        AND DATE_TRUNC('day', (decision::jsonb->>'dateDecision')::timestamptz) = '${DATE_BUG}'
        AND DATE_TRUNC('day', (decision::jsonb->>'dateDebut')::timestamptz)
          = DATE_TRUNC('day', (decision::jsonb->>'dateFin')::timestamptz)
    `);

    const comptageHistoryStatesBug: Array<{ lignes_touchees: string }> =
      await queryRunner.query(`
        SELECT COUNT(*) AS lignes_touchees
        FROM usager_history_states
        WHERE "createdEvent" = 'new-decision'
          AND (decision::jsonb->>'statut') = 'VALIDE'
          AND DATE_TRUNC('day', ("createdAt")::timestamptz) = '${DATE_BUG}'
          AND DATE_TRUNC('day', (decision::jsonb->>'dateDebut')::timestamptz)
            = DATE_TRUNC('day', (decision::jsonb->>'dateFin')::timestamptz)
      `);

    // ─────────────────────────────────────────────────────────
    // Étape 0b — Comptage élargi : TOUS les cas dateDebut = dateFin
    //            (toutes dates de décision confondues)
    // ─────────────────────────────────────────────────────────
    const comptageTotal: Array<{
      usagers_touches: string;
      structures_touchees: string;
    }> = await queryRunner.query(`
      SELECT
        COUNT(*) AS usagers_touches,
        COUNT(DISTINCT "structureId") AS structures_touchees
      FROM usager
      WHERE statut = 'VALIDE'
        AND DATE_TRUNC('day', (decision::jsonb->>'dateDebut')::timestamptz)
          = DATE_TRUNC('day', (decision::jsonb->>'dateFin')::timestamptz)
    `);

    const comptageHistoryStatesTotal: Array<{ lignes_touchees: string }> =
      await queryRunner.query(`
        SELECT COUNT(*) AS lignes_touchees
        FROM usager_history_states
        WHERE "createdEvent" = 'new-decision'
          AND (decision::jsonb->>'statut') = 'VALIDE'
          AND DATE_TRUNC('day', (decision::jsonb->>'dateDebut')::timestamptz)
            = DATE_TRUNC('day', (decision::jsonb->>'dateFin')::timestamptz)
      `);

    // ─────────────────────────────────────────────────────────
    // Répartition élargie par date de décision (top 20)
    // ─────────────────────────────────────────────────────────
    const repartitionParDate: Array<{
      date_decision: string;
      nb_usagers: string;
      nb_structures: string;
    }> = await queryRunner.query(`
      SELECT
        DATE_TRUNC('day', (decision::jsonb->>'dateDecision')::timestamptz)::date AS date_decision,
        COUNT(*) AS nb_usagers,
        COUNT(DISTINCT "structureId") AS nb_structures
      FROM usager
      WHERE statut = 'VALIDE'
        AND DATE_TRUNC('day', (decision::jsonb->>'dateDebut')::timestamptz)
          = DATE_TRUNC('day', (decision::jsonb->>'dateFin')::timestamptz)
      GROUP BY 1
      ORDER BY nb_usagers DESC
      LIMIT 20
    `);

    console.log(`\n${"═".repeat(80)}`);
    console.log(`COMPTAGE — CAS DU JOUR DU BUG (dateDecision = ${DATE_BUG})`);
    console.log(
      `  Usagers touchés                    : ${comptageBug[0].usagers_touches}`
    );
    console.log(
      `  Structures touchées                : ${comptageBug[0].structures_touchees}`
    );
    console.log(
      `  Lignes usager_history_states       : ${comptageHistoryStatesBug[0].lignes_touchees}`
    );
    console.log(`${"═".repeat(80)}\n`);

    console.log(`${"═".repeat(80)}`);
    console.log(`COMPTAGE — TOUS CAS dateDebut = dateFin (toutes dates)`);
    console.log(
      `  Usagers touchés                    : ${comptageTotal[0].usagers_touches}`
    );
    console.log(
      `  Structures touchées                : ${comptageTotal[0].structures_touchees}`
    );
    console.log(
      `  Lignes usager_history_states       : ${comptageHistoryStatesTotal[0].lignes_touchees}`
    );
    console.log(`${"═".repeat(80)}\n`);

    console.log(`${"═".repeat(80)}`);
    console.log(`RÉPARTITION PAR DATE DE DÉCISION (top 20, tous cas)`);
    for (const row of repartitionParDate) {
      const isBugDay = row.date_decision === DATE_BUG ? " ◄ BUG" : "";
      console.log(
        `  ${row.date_decision}  | usagers: ${String(row.nb_usagers).padStart(
          5
        )}  | structures: ${String(row.nb_structures).padStart(4)}${isBugDay}`
      );
    }
    console.log(`${"═".repeat(80)}\n`);

    // ─────────────────────────────────────────────────────────
    // Chargement des usagers à corriger
    // NOTE : on corrige TOUS les cas (dateDebut = dateFin),
    //        quelle que soit la dateDecision
    // ─────────────────────────────────────────────────────────
    const usagers = await usagerRepository
      .createQueryBuilder("u")
      .select([
        "u.uuid",
        "u.structureId",
        "u.ref",
        "u.decision",
        "u.historique",
      ])
      .where("u.statut = 'VALIDE'")
      .andWhere(
        `DATE_TRUNC('day', (u.decision::jsonb->>'dateDebut')::timestamptz) = DATE_TRUNC('day', (u.decision::jsonb->>'dateFin')::timestamptz)`
      )
      .getMany();

    let totalUsagersModifies = 0;
    let totalHistoryStatesModifies = 0;

    for (const usager of usagers) {
      const decision = usager.decision as unknown as UsagerDecision;
      const historique = usager.historique as unknown as UsagerDecision[];

      // Calcul de la nouvelle dateFin = dateDebut + 1 an
      const dateDebut = new Date(decision.dateDebut!);
      const newDateFin = new Date(dateDebut);
      newDateFin.setFullYear(newDateFin.getFullYear() + 1);

      const dateDecision = new Date(decision.dateDecision!);
      const isBugDay =
        dateDecision.toISOString().slice(0, 10) === DATE_BUG ? " ◄ BUG" : "";

      console.log(`\n${"─".repeat(80)}`);
      console.log(
        `Usager : ${usager.uuid} | ref=${usager.ref} | structureId=${usager.structureId}${isBugDay}`
      );
      console.log(
        `  dateDecision     : ${dateDecision.toISOString().slice(0, 10)}`
      );
      console.log(`  dateDebut        : ${dateDebut.toISOString()}`);
      console.log(
        `  dateFin actuelle : ${new Date(decision.dateFin!).toISOString()}`
      );
      console.log(`  dateFin corrigée : ${newDateFin.toISOString()}`);

      if (!DRY_RUN) {
        // ── Correction de usager.decision ──────────────────
        const decisionCorrigee = { ...decision, dateFin: newDateFin };
        await usagerRepository.update(
          { uuid: usager.uuid },
          { decision: decisionCorrigee as any }
        );

        // ── Correction de usager.historique ───────────────
        const historiqueCorrige = historique.map((d) =>
          d.uuid === decision.uuid ? { ...d, dateFin: newDateFin } : d
        );
        await usagerRepository.update(
          { uuid: usager.uuid },
          { historique: historiqueCorrige as any }
        );
      }

      totalUsagersModifies++;

      // ── Correction dans usager_history_states ──────────
      const historyStatesToFix = (await usagerHistoryStatesRepository
        .createQueryBuilder("uhs")
        .select(["uhs.uuid", "uhs.decision", "uhs.createdAt"])
        .where(`uhs."usagerUUID" = :usagerUUID`, { usagerUUID: usager.uuid })
        .andWhere(`uhs."createdEvent" = 'new-decision'`)
        .andWhere(`uhs.decision::jsonb->>'statut' = 'VALIDE'`)
        .andWhere(
          `DATE_TRUNC('day', (uhs.decision::jsonb->>'dateDebut')::timestamptz) = DATE_TRUNC('day', (uhs.decision::jsonb->>'dateFin')::timestamptz)`
        )
        .getMany()) as unknown as UsagerHistoryStates[];

      console.log(
        `  [history_states] ${historyStatesToFix.length} ligne(s) à corriger`
      );

      for (const hs of historyStatesToFix) {
        const decisionHs = hs.decision as Partial<UsagerDecision>;
        const dateDebutHs = new Date(decisionHs.dateDebut!);
        const newDateFinHs = new Date(dateDebutHs);
        newDateFinHs.setFullYear(newDateFinHs.getFullYear() + 1);

        const decisionHsCorrigee = { ...decisionHs, dateFin: newDateFinHs };

        console.log(
          `     rowUuid=${hs.uuid} | createdAt=${new Date(
            hs.createdAt
          ).toISOString()} | dateFin corrigée: ${newDateFinHs.toISOString()}`
        );

        if (!DRY_RUN) {
          await usagerHistoryStatesRepository.update(
            { uuid: hs.uuid },
            { decision: decisionHsCorrigee as any }
          );
        }

        totalHistoryStatesModifies++;
      }
    }

    // ─────────────────────────────────────────────────────────
    // Résumé final
    // ─────────────────────────────────────────────────────────
    console.log(`\n${"═".repeat(80)}`);
    console.log(`RÉSUMÉ FINAL | DRY_RUN=${DRY_RUN}`);
    console.log(
      `  Usagers corrigés                   : ${totalUsagersModifies}`
    );
    console.log(
      `  Lignes history_states corrigées    : ${totalHistoryStatesModifies}`
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
        "Fin de migration - vérifier les logs pour le résumé détaillé"
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Migration unidirectionnelle
  }
}
