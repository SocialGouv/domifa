import * as ExcelJS from "exceljs";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { addYears, endOfDay, startOfYear } from "date-fns";
import { COUNTRY_CODES_TIMEZONE, UsagersImportMode } from "@domifa/common";
import { parseAndValidateImportFile } from "./parseAndValidateImportFile";
import {
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

  it("garde l'event loop du thread principal LIBRE pendant le traitement", async () => {
    let ticks = 0;
    const heartbeat = setInterval(() => ticks++, 5);
    try {
      const result = await usagersImportRunner.parseAndValidate(
        input(heavyFile)
      );
      expect(result.totalCount).toBe(HEAVY_ROWS);
    } finally {
      clearInterval(heartbeat);
    }
    // Le traitement dure plusieurs secondes ; si l'event loop est resté libre,
    // le heartbeat (5 ms) a battu des centaines de fois.
    expect(ticks).toBeGreaterThan(50);
  }, 30000);

  it("CONTRASTE : le même traitement EN INLINE bloque l'event loop", async () => {
    let ticks = 0;
    const heartbeat = setInterval(() => ticks++, 5);
    try {
      // Exactement le code d'avant le fix, sur le thread principal.
      const result = await parseAndValidateImportFile(input(heavyFile));
      expect(result.totalCount).toBe(HEAVY_ROWS);
    } finally {
      clearInterval(heartbeat);
    }
    // Le parse+validation synchrone a monopolisé l'event loop : le timer de 5 ms
    // n'a quasiment pas pu se déclencher. C'est la panne du 11/08 en miniature.
    expect(ticks).toBeLessThan(10);
  }, 30000);

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
});
