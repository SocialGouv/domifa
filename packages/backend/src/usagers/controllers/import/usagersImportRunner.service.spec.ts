import * as ExcelJS from "exceljs";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { addYears, endOfDay, startOfYear } from "date-fns";
import { COUNTRY_CODES_TIMEZONE, UsagersImportMode } from "@domifa/common";
import { parseAndValidateImportFile } from "./parseAndValidateImportFile";
import {
  IMPORT_MAX_CONCURRENT_WORKERS,
  ImportWorkerInput,
  usagersImportRunner,
} from "./usagersImportRunner.service";
import { UsagersImportUsagerSchemaContext } from "./step2-validate-row";

// Le cœur du fix : parse + validation d'import dans un WORKER THREAD, borné dans
// le temps, pour qu'un fichier pathologique bloque le worker et NON l'event loop
// du pod. Ce spec prouve les trois propriétés qui manquaient le 11/08 :
//   1. pendant le traitement, l'event loop du thread principal reste LIBRE ;
//   2. le contraste : le même traitement en inline le bloque (mutation-proof) ;
//   3. un fichier trop long est coupé net (timeout), un fichier trop gros refusé.

const importFilesDir = resolve(__dirname, "../../../_static/usagers-import-test");

const context: UsagersImportUsagerSchemaContext = {
  minDate: startOfYear(new Date("1900-01-01")),
  nextYear: addYears(endOfDay(new Date()), 1),
  today: endOfDay(new Date()),
  countryCode: COUNTRY_CODES_TIMEZONE["Europe/Paris"],
};

const HEADER = Array.from({ length: 19 }, (_, i) => `col${i}`);
const VALID_ROW = [
  100000, "H", "TOURE", "M.", "TOURE", "22/06/1980", "Sénégal", "0601010101",
  "", "VALIDE", null, null, "PREMIERE", "19/11/2020", "19/11/2021",
  "19/11/2020", "26/11/2020", "OUI", "AMI",
];

let tmpDir: string;
// Assez de lignes pour un parse+validation de quelques secondes : fenêtre
// confortable pour observer (ou ne pas observer) les battements de l'event loop.
const HEAVY_ROWS = 15000;

const buildHeavyFile = async (path: string, rows: number): Promise<void> => {
  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: path });
  const ws = wb.addWorksheet("import");
  ws.addRow(HEADER).commit();
  for (let i = 0; i < rows; i++) {
    ws.addRow([100000 + i, ...VALID_ROW.slice(1)]).commit();
  }
  ws.commit();
  await wb.commit();
};

const input = (
  filePath: string,
  overrides: Partial<ImportWorkerInput> = {}
): ImportWorkerInput => ({
  filePath,
  importMode: UsagersImportMode.preview,
  context,
  maxErrors: 20,
  ...overrides,
});

describe("usagersImportRunner (worker thread)", () => {
  let heavyFile: string;

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "domifa-import-runner-"));
    heavyFile = join(tmpDir, "heavy.xlsx");
    await buildHeavyFile(heavyFile, HEAVY_ROWS);
  }, 60000);

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("rend le même résultat que le traitement direct (parité worker)", async () => {
    const file = resolve(importFilesDir, "import_ok_1.xlsx");
    const direct = await parseAndValidateImportFile(
      input(file, { importMode: UsagersImportMode.confirm })
    );
    const viaWorker = await usagersImportRunner.parseAndValidate(
      input(file, { importMode: UsagersImportMode.confirm })
    );
    expect(viaWorker.usagersRows).toEqual(direct.usagersRows);
    expect(viaWorker.importErrors).toEqual(direct.importErrors);
    expect(viaWorker.totalCount).toBe(direct.totalCount);
    expect(viaWorker.usagersRows).toHaveLength(19);
  }, 30000);

  // Compte les battements d'un timer 5 ms pendant l'exécution de `fn` : la
  // mesure de la liberté de l'event loop du thread principal.
  const ticksDuring = async (fn: () => Promise<unknown>): Promise<number> => {
    let ticks = 0;
    const heartbeat = setInterval(() => ticks++, 5);
    try {
      await fn();
    } finally {
      clearInterval(heartbeat);
    }
    return ticks;
  };

  it("garde l'event loop LIBRE via le worker, là où l'inline le BLOQUE", async () => {
    // Le même travail, sur la même machine : en inline (le code d'avant le fix)
    // il monopolise l'event loop, via le worker il le laisse respirer. On
    // compare les deux plutôt qu'un seuil absolu — le RATIO tient quelle que
    // soit la charge de la CI. C'est la panne du 11/08 en miniature.
    const inlineTicks = await ticksDuring(() =>
      parseAndValidateImportFile(input(heavyFile))
    );
    const workerTicks = await ticksDuring(() =>
      usagersImportRunner.parseAndValidate(input(heavyFile))
    );

    expect(workerTicks).toBeGreaterThan(50);
    expect(workerTicks).toBeGreaterThan(inlineTicks * 5);
  }, 60000);

  it("coupe net un traitement qui dépasse le timeout", async () => {
    await expect(
      usagersImportRunner.parseAndValidate(input(heavyFile), { timeoutMs: 50 })
    ).rejects.toMatchObject({ code: "IMPORT_TIMEOUT" });
  }, 30000);

  it("garde l'event loop libre MÊME quand le worker part en timeout", async () => {
    let ticks = 0;
    const heartbeat = setInterval(() => ticks++, 5);
    await usagersImportRunner
      .parseAndValidate(input(heavyFile), { timeoutMs: 500 })
      .catch(() => undefined);
    clearInterval(heartbeat);
    expect(ticks).toBeGreaterThan(20);
  }, 30000);

  it("refuse un fichier au-delà de la borne de lignes", async () => {
    await expect(
      usagersImportRunner.parseAndValidate(input(heavyFile, { maxRows: 10 }))
    ).rejects.toMatchObject({ code: "IMPORT_TOO_MANY_ROWS" });
  }, 30000);

  it("borne le nombre de workers concurrents (IMPORT_BUSY au-delà)", async () => {
    // Le compteur s'incrémente de façon SYNCHRONE à l'appel : lancer
    // MAX+1 imports d'affilée fait rejeter le dernier immédiatement, sans
    // file d'attente non bornée. Les MAX premiers aboutissent.
    const launched = Array.from(
      { length: IMPORT_MAX_CONCURRENT_WORKERS + 1 },
      () => usagersImportRunner.parseAndValidate(input(heavyFile))
    );
    const results = await Promise.allSettled(launched);

    const busy = results.filter(
      (r) =>
        r.status === "rejected" &&
        (r.reason as { code?: string })?.code === "IMPORT_BUSY"
    );
    const done = results.filter((r) => r.status === "fulfilled");
    expect(busy).toHaveLength(1);
    expect(done).toHaveLength(IMPORT_MAX_CONCURRENT_WORKERS);
  }, 30000);

  it("libère le compteur sur échec — pas de DoS permanent après N erreurs", async () => {
    // Un compteur qui fuirait sur les chemins d'erreur finirait par refuser
    // tout import (IMPORT_BUSY à vie). On échoue plus de fois que le cap, puis
    // on vérifie qu'un import valide passe encore.
    const missing = input(join(tmpDir, "does-not-exist.xlsx"));
    for (let i = 0; i < IMPORT_MAX_CONCURRENT_WORKERS + 2; i++) {
      await usagersImportRunner.parseAndValidate(missing).catch(() => undefined);
    }
    const ok = await usagersImportRunner.parseAndValidate(
      input(resolve(importFilesDir, "import_ok_1.xlsx"), {
        importMode: UsagersImportMode.confirm,
      })
    );
    expect(ok.usagersRows).toHaveLength(19);
  }, 30000);
});
