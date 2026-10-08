import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";
import { appLogger } from "../util";
import { FamillesAnalysisService } from "../modules/familles/services";

// Read-only analysis for the "familles" project: how many dependants (conjoint,
// children, parents) declared on a dossier already have their own dossier, how
// many couples, how many children counted twice, what population "gap" each
// structure will lose from its stats once households are linked.
//
// It only runs on preprod / prod (real names and birth dates, needed for the
// comparison, exist nowhere else). It writes nothing to the database and exports
// only per-structure counters to a CSV on S3 — no personal data, not even a
// dossier reference.
//
// One shot: any failure is logged (Sentry) and swallowed so that a read-only
// analysis can never block the API boot — migrations run inside
// DataSource.initialize() — which also means the migration is recorded as
// applied even when the analysis failed. The full CSV is logged before the S3
// upload, so a failed upload still leaves the results in the logs. To run it
// again, delete its row from the `migrations` table.
export class AnalyseFamillesAyantsDroits1791448691664
  implements MigrationInterface
{
  name = "AnalyseFamillesAyantsDroits1791448691664";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const env = domifaConfig().envId;
    if (env !== "prod" && env !== "preprod") {
      appLogger.warn(
        `[familles-analysis] skipped: env "${env}" (prod/preprod only)`
      );
      return;
    }
    try {
      await new FamillesAnalysisService().run(queryRunner);
    } catch (error) {
      appLogger.error(`[familles-analysis] failed, skipped`, {
        error,
        sentry: true,
      });
    }
  }

  public async down(): Promise<void> {
    // read-only migration, nothing to revert
    return;
  }
}
