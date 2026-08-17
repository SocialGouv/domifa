import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

interface UsagerHistoriqueDecisionRow {
  statut?: string;
  dateDebut?: string | Date | null;
}

// dateDerniereDom = date de début de la domiciliation en cours, ininterrompue.
// L'historique stocké en base n'est pas toujours complet depuis l'origine
// (usagers importés en masse avec un historique réduit à la décision
// courante, anciennes fiches saisies manuellement...) : on ne peut donc pas
// se fier uniquement à la présence d'une décision VALIDE dans l'historique
// pour détecter une continuité. On part donc du principe que datePremiereDom
// est correcte tant qu'aucune radiation/refus n'est explicitement visible
// dans l'historique disponible, et on ne la remplace que si une telle
// interruption y est trouvée, par la date de la 1ère décision VALIDE qui la
// suit (null si l'usager n'a pas encore été revalidé depuis).
const computeDateDerniereDom = (
  datePremiereDom: Date | string | null,
  historique: UsagerHistoriqueDecisionRow[] | null
): Date | null => {
  const decisions = historique ?? [];

  let lastBreakIndex = -1;
  decisions.forEach((decision, index) => {
    if (decision?.statut === "RADIE" || decision?.statut === "REFUS") {
      lastBreakIndex = index;
    }
  });

  if (lastBreakIndex === -1) {
    return datePremiereDom ? new Date(datePremiereDom) : null;
  }

  for (let i = lastBreakIndex + 1; i < decisions.length; i++) {
    if (decisions[i]?.statut === "VALIDE" && decisions[i].dateDebut) {
      return new Date(decisions[i].dateDebut as string | Date);
    }
  }

  return null;
};

export class AddUsagerDateDerniereDom1786973009184
  implements MigrationInterface
{
  name = "AddUsagerDateDerniereDom1786973009184";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId !== "prod" &&
      domifaConfig().envId !== "preprod" &&
      domifaConfig().envId !== "local"
    ) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "usager" ADD "dateDerniereDom" timestamptz`
    );

    const pageSize = 500;
    let offset = 0;
    let totalUpdated = 0;

    for (;;) {
      const rows: {
        uuid: string;
        datePremiereDom: Date | string | null;
        historique: UsagerHistoriqueDecisionRow[] | null;
      }[] = await queryRunner.query(
        `SELECT uuid, "datePremiereDom", historique
           FROM "usager"
          ORDER BY uuid
          LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      if (rows.length === 0) {
        break;
      }

      const values: string[] = [];
      const params: unknown[] = [];

      rows.forEach((row, index) => {
        const dateDerniereDom = computeDateDerniereDom(
          row.datePremiereDom,
          row.historique
        );
        const base = index * 2;
        values.push(`($${base + 1}::uuid, $${base + 2}::timestamptz)`);
        params.push(row.uuid, dateDerniereDom);
      });

      await queryRunner.query(
        `UPDATE "usager" AS u
            SET "dateDerniereDom" = c.val
           FROM (VALUES ${values.join(", ")}) AS c(uuid, val)
          WHERE u.uuid = c.uuid`,
        params
      );

      totalUpdated += rows.length;
      offset += pageSize;
    }

    appLogger.warn(
      `[backfill dateDerniereDom] ${totalUpdated} usagers mis à jour`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "dateDerniereDom"`
    );
  }
}
