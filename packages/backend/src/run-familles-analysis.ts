import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { domifaConfig } from "./config";
import { FamillesAnalysisService } from "./modules/familles/services";
import { appLogger } from "./util";

// One-shot, out-of-band run of the "familles" read-only analysis (see
// FamillesAnalysisService for what it does and why). Deliberately NOT wired as
// a migration: it scans the whole `usager` table and can take minutes on a
// national-scale database, which is unsafe inside `DataSource.initialize()` —
// that runs on every API boot, before Nest starts listening, so a slow or
// failing run there would delay the readiness probe on every pod and, on a
// rolling deploy, on every replica at once.
//
// Run with: pnpm --filter @domifa/backend familles:analysis
// Prod/preprod only (real names and birth dates, needed for the comparison,
// exist nowhere else). Safe to re-run: read-only, no state is tracked between
// runs — a failed run (including a failed S3 upload) simply produces nothing
// and exits non-zero; just run it again.
(async () => {
  const env = domifaConfig().envId;
  if (env !== "prod" && env !== "preprod") {
    appLogger.warn(
      `[familles-analysis] skipped: env "${env}" (prod/preprod only)`
    );
    return;
  }

  appLogger.warn(`[${__filename}] Starting app...`);
  const { app, postgresTypeormConnection } = await bootstrapApplication();
  const queryRunner = postgresTypeormConnection.createQueryRunner();
  try {
    appLogger.warn(`[familles-analysis] starting...`);
    await new FamillesAnalysisService().run(queryRunner);
  } catch (error) {
    appLogger.error(`[familles-analysis] failed`, { error, sentry: true });
    process.exitCode = 1;
  } finally {
    await queryRunner.release();
    appLogger.warn(`[${__filename}] Closing app...`);
    await tearDownApplication({ app, postgresTypeormConnection });
    process.exit();
  }
})();
