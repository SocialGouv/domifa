import ExcelJS from "exceljs";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { usagersImportExcelParser } from "./usagersImportExcelParser.service";

const FIXTURE = resolve(
  __dirname,
  "../../../../_static/usagers-import-test/import_ok_1.xlsx"
);

// Same spreadsheet as the HTTP import test, with a few cells corrupted the way
// a pasted or hand-edited file could be.
async function corruptedCopy(): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(FIXTURE);
  const sheet = workbook.worksheets[0];
  const row = sheet.getRow(2);
  row.getCell(3).value = "<b>Dup</b>ont<svg/onload=alert(1)>"; // nom
  row.getCell(4).value = "  Jean-Pierre   O'Neil & fils "; // prenom
  row.getCell(5).value = "<img src=x onerror=alert(1)>"; // surnom
  row.getCell(9).value = "Paul.DUPONT@Example.ORG"; // email
  row.getCell(36).value = "Ligne 1\nLigne 2 <b>gras</b>"; // commentaires
  row.commit();
  const filePath = join(
    mkdtempSync(join(tmpdir(), "domifa-import-")),
    "corrupted.xlsx"
  );
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

describe("usagersImportExcelParser — cells go through the DTO sanitizer", () => {
  it("strips markup, normalises whitespace and empties tag-only cells", async () => {
    const rows = await usagersImportExcelParser.parseFile(
      await corruptedCopy(),
      { fileName: "corrupted.xlsx", structureId: 1 }
    );
    const first = rows[0].row;
    expect(rows[0].rowNumber).toEqual(2);
    expect(first[2]).toEqual("Dupont");
    expect(first[3]).toEqual("Jean-Pierre O'Neil & fils");
    expect(first[4]).toBeUndefined();
    expect(first[8]).toEqual("Paul.DUPONT@Example.ORG");
    expect(first[35]).toEqual("Ligne 1 Ligne 2 gras");
  });
});
