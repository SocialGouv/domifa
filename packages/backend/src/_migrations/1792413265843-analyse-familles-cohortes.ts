import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";
import { appLogger } from "../util";
import { FamillesAnalysisService } from "../modules/familles/services";

// Read-only analysis for the "familles" project, second version. Same question
// as the first run (how many people are counted twice because they are both a
// dependant of a dossier and a dossier, or a dependant of several dossiers),
// but every figure now belongs to a cohort: a base and sub-groups that add up
// exactly to it.
//   ayants droit    = conjoints + enfants + parents + autres
//   conjoints       = sans date + identiques + très proches + douteux
//                     + autre structure + non trouvés
//   enfants         = sans date + mineurs + majeurs
//   enfants majeurs = identiques + très proches + douteux
//                     + autre structure + non trouvés
// plus the children declared on several dossiers of a structure, couple or not.
//
// It only runs on preprod / prod (real names and birth dates, needed for the
// comparison, exist nowhere else). It writes nothing to the database and exports
// only per-structure counters to a CSV on S3 (familles_par_structure_v2.csv,
// next to the first run's file) — no personal data, not even a dossier
// reference.
//
// One shot: any failure is logged (Sentry) and swallowed so that a read-only
// analysis can never block the API boot — migrations run inside
// DataSource.initialize() — which also means the migration is recorded as
// applied even when the analysis failed. The full CSV is logged before the S3
// upload, so a failed upload still leaves the results in the logs. To run it
// again, delete its row from the `migrations` table.
export class AnalyseFamillesCohortes1792413265843
  implements MigrationInterface
{
  name = "AnalyseFamillesCohortes1792413265843";

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
