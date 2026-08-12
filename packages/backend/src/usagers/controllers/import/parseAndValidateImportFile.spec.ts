import { resolve } from "path";
import { addYears, endOfDay, startOfYear } from "date-fns";
import { COUNTRY_CODES_TIMEZONE, UsagersImportMode } from "@domifa/common";
import {
  IMPORT_MAX_ROWS,
  parseAndValidateImportFile,
} from "./parseAndValidateImportFile";
import { UsagersImportUsagerSchemaContext } from "./step2-validate-row";

// Parité de la logique extraite du contrôleur vers le worker : mêmes fixtures,
// mêmes comptes que le test d'intégration HTTP existant (`import.controller.
// spec.ts`), sans base ni boot d'app. Plus la borne de lignes.
const importFilesDir = resolve(__dirname, "../../../_static/usagers-import-test");

const context: UsagersImportUsagerSchemaContext = {
  minDate: startOfYear(new Date("1900-01-01")),
  nextYear: addYears(endOfDay(new Date()), 1),
  today: endOfDay(new Date()),
  countryCode: COUNTRY_CODES_TIMEZONE["Europe/Paris"],
};

const run = (fileName: string, importMode: UsagersImportMode, maxRows?: number) =>
  parseAndValidateImportFile({
    filePath: resolve(importFilesDir, fileName),
    importMode,
    context,
    maxErrors: 20,
    maxRows,
  });

describe("parseAndValidateImportFile", () => {
  it("valide un fichier correct — mêmes comptes que le test HTTP (19 dossiers)", async () => {
    const r = await run("import_ok_1.xlsx", UsagersImportMode.confirm);
    expect(r.importErrors).toHaveLength(0);
    expect(r.usagersRows).toHaveLength(19);
    // confirm + sans erreur : les lignes vont dans usagersRows, pas l'aperçu
    expect(r.importPreviewRows).toHaveLength(0);
    expect(r.totalCount).toBe(0);
  });

  it("remonte les erreurs d'un fichier incorrect (5 erreurs, 2 lignes, 0 actif)", async () => {
    const r = await run("import_ko_1.xlsx", UsagersImportMode.confirm);
    expect(r.importErrors).toHaveLength(5);
    expect(r.importPreviewRows).toHaveLength(2);
    expect(r.previewUsagersRow).toHaveLength(0);
  });

  it("en mode preview, rend toutes les lignes dans l'aperçu", async () => {
    const r = await run("import_ok_1.xlsx", UsagersImportMode.preview);
    expect(r.importErrors).toHaveLength(0);
    expect(r.importPreviewRows).toHaveLength(19);
    expect(r.totalCount).toBe(19);
    // toutes les lignes valides et VALIDE -> previewUsagersRow
    expect(r.previewUsagersRow.length).toBeGreaterThan(0);
  });

  it("expose totalRows (lignes lues) indépendamment du mode", async () => {
    // En confirm sans erreur, totalCount vaut 0 (aucune ligne d'aperçu) mais
    // totalRows compte bien les 19 lignes lues — c'est ce que trace le log.
    const confirm = await run("import_ok_1.xlsx", UsagersImportMode.confirm);
    expect(confirm.totalCount).toBe(0);
    expect(confirm.totalRows).toBe(19);
  });

  it("refuse un fichier au-delà de la borne de lignes", async () => {
    await expect(
      run("import_ok_1.xlsx", UsagersImportMode.confirm, 1)
    ).rejects.toMatchObject({ code: "IMPORT_TOO_MANY_ROWS" });
  });

  it("expose une borne par défaut généreuse (> la plus grosse structure)", () => {
    // ~49 000 dossiers pour la plus grosse structure : la borne ne doit pas
    // casser un vrai gros import.
    expect(IMPORT_MAX_ROWS).toBeGreaterThan(49000);
  });
});
