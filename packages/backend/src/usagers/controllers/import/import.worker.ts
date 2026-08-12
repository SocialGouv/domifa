import { parentPort, workerData } from "node:worker_threads";
import {
  ImportParseAndValidateResult,
  parseAndValidateImportFile,
} from "./parseAndValidateImportFile";
import type { ImportWorkerInput } from "./usagersImportRunner.service";

// Point d'entrée du worker thread : parse + validation d'un fichier d'import,
// hors du thread principal, pour qu'un fichier pathologique bloque CE worker et
// non l'event loop du pod. Compilé en `import.worker.js` (prod) ; lancé en
// `.ts` via ts-node en dev. Ne renvoie que des données sérialisables.

async function run(): Promise<void> {
  if (!parentPort) {
    throw new Error("import.worker must be run as a worker thread");
  }

  const input = workerData as ImportWorkerInput;

  try {
    const result: ImportParseAndValidateResult =
      await parseAndValidateImportFile(input);
    parentPort.postMessage({ ok: true, result });
  } catch (err) {
    parentPort.postMessage({
      ok: false,
      code: (err as { code?: string })?.code,
      message: (err as Error)?.message,
    });
  }
}

run().catch((err) => {
  // Un throw hors du try (ex. échec de chargement de module) ne doit pas
  // laisser le worker pendre : on le signale au parent, qui rejette.
  parentPort?.postMessage({
    ok: false,
    code: "IMPORT_WORKER_FAILURE",
    message: (err as Error)?.message,
  });
});
