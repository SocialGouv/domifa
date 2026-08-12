import * as path from "node:path";
import { Worker } from "node:worker_threads";
import { UsagersImportMode } from "@domifa/common";
import { UsagersImportUsagerSchemaContext } from "./step2-validate-row";
import { ImportParseAndValidateResult } from "./parseAndValidateImportFile";

export type ImportWorkerInput = {
  filePath: string;
  importMode: UsagersImportMode;
  context: UsagersImportUsagerSchemaContext;
  maxErrors: number;
  maxRows?: number;
};

// Codes d'erreur remontés au contrôleur.
export type ImportRunnerErrorCode =
  | "IMPORT_TIMEOUT"
  | "IMPORT_TOO_MANY_ROWS"
  | "IMPORT_WORKER_FAILURE"
  | "IMPORT_WORKER_EXIT"
  | "IMPORT_BUSY";

export class ImportRunnerError extends Error {
  constructor(public readonly code: ImportRunnerErrorCode, message: string) {
    super(message);
    this.name = "ImportRunnerError";
  }
}

// Wall-clock au-delà duquel on tue le worker. Un import légitime, même le plus
// gros (~49 000 dossiers ≈ quelques secondes), reste très en dessous ; un
// fichier pathologique est coupé net au lieu de tenir un cœur ~50 s comme lors
// de l'incident du 11/08. Un timeout côté thread principal serait sans effet :
// le blocage est synchrone, son callback ne se déclencherait jamais — c'est
// l'isolation en worker qui rend ce timeout efficace.
export const IMPORT_WORKER_TIMEOUT_MS = 30_000;

// Borne mémoire du worker : une bombe de décompression xlsx OOM le WORKER
// (capté ici) plutôt que le pod.
const IMPORT_WORKER_MAX_OLD_SPACE_MB = 512;

// Nombre de workers d'import simultanés par pod. Chaque worker coûte jusqu'à
// 512 Mo et ~1 cœur pendant 30 s : sans cap, plusieurs imports concurrents
// (un compte responsable/admin par requête) affameraient le CPU du pod. Au
// -delà, on refuse tôt (IMPORT_BUSY) plutôt que d' empiler une file non bornée.
export const IMPORT_MAX_CONCURRENT_WORKERS = 3;
let activeWorkers = 0;

// En dev l'app tourne via ts-node (`__filename` en `.ts`) ; en prod c'est le
// `.js` compilé. Le worker doit pointer le bon fichier et, en dev, charger
// ts-node (transpile-only : le type-check est déjà fait par le build/CI, on ne
// veut pas le refaire — ni le faire échouer — dans le worker).
const RUNNING_FROM_TS = __filename.endsWith(".ts");
const WORKER_FILE = path.resolve(
  __dirname,
  RUNNING_FROM_TS ? "import.worker.ts" : "import.worker.js"
);
const WORKER_EXEC_ARGV = RUNNING_FROM_TS
  ? ["-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register"]
  : [];
// En dev, le worker charge ts-node : on lui donne explicitement le tsconfig du
// backend (indépendamment du cwd) et le transpile-only (le type-check est fait
// par le build/CI, pas au runtime). Le backend est 4 niveaux au-dessus de
// `src/usagers/controllers/import`. Rien de tout ça en prod (JS compilé).
const WORKER_ENV = RUNNING_FROM_TS
  ? {
      ...process.env,
      TS_NODE_TRANSPILE_ONLY: "1",
      TS_NODE_PROJECT: path.resolve(__dirname, "../../../../tsconfig.json"),
    }
  : process.env;

export const usagersImportRunner = {
  parseAndValidate,
};

function parseAndValidate(
  input: ImportWorkerInput,
  { timeoutMs = IMPORT_WORKER_TIMEOUT_MS }: { timeoutMs?: number } = {}
): Promise<ImportParseAndValidateResult> {
  if (activeWorkers >= IMPORT_MAX_CONCURRENT_WORKERS) {
    return Promise.reject(
      new ImportRunnerError(
        "IMPORT_BUSY",
        `already ${activeWorkers} import workers running`
      )
    );
  }
  activeWorkers++;

  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_FILE, {
      workerData: input,
      execArgv: WORKER_EXEC_ARGV,
      env: WORKER_ENV,
      resourceLimits: {
        maxOldGenerationSizeMb: IMPORT_WORKER_MAX_OLD_SPACE_MB,
      },
    });

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      activeWorkers--;
      clearTimeout(timer);
      // `terminate()` est idempotent ; on nettoie dans tous les cas.
      void worker.terminate();
      fn();
    };

    const timer = setTimeout(() => {
      finish(() =>
        reject(
          new ImportRunnerError(
            "IMPORT_TIMEOUT",
            `import worker exceeded ${timeoutMs}ms`
          )
        )
      );
    }, timeoutMs);
    // Ne pas retenir l'event loop du process à cause de ce timer.
    timer.unref?.();

    worker.once(
      "message",
      (msg: {
        ok: boolean;
        result?: ImportParseAndValidateResult;
        code?: ImportRunnerErrorCode;
        message?: string;
      }) => {
        finish(() => {
          if (msg.ok && msg.result) {
            resolve(msg.result);
          } else {
            reject(
              new ImportRunnerError(
                msg.code ?? "IMPORT_WORKER_FAILURE",
                msg.message ?? "import worker failed"
              )
            );
          }
        });
      }
    );

    worker.once("error", (err: Error) => {
      // Inclut l'OOM du worker (dépassement de `maxOldGenerationSizeMb`).
      finish(() =>
        reject(new ImportRunnerError("IMPORT_WORKER_FAILURE", err.message))
      );
    });

    worker.once("exit", (code: number) => {
      // N'arrive qu'en sortie anormale non déjà signalée (message/error/timeout
      // ont réglé le sort avant).
      if (code !== 0) {
        finish(() =>
          reject(
            new ImportRunnerError(
              "IMPORT_WORKER_EXIT",
              `import worker exited with code ${code}`
            )
          )
        );
      }
    });
  });
}
