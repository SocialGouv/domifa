import { HttpStatus } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { AppTestHttpClient } from "../../../util/test/AppTestHttpClient.service";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { CerfaService } from "../../services/cerfa.service";
import { DocumentsService } from "../../services/documents.service";
import { UsagersService } from "../../services/usagers.service";
import { ImportController } from "./import.controller";

const importFilesDir = path.resolve(
  __dirname,
  "../../../_static/usagers-import-test"
);

describe("Import Controller", () => {
  let controller: ImportController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [ImportController],
        imports: [UsersModule, StructuresModule],
        providers: [CerfaService, UsagersService, DocumentsService],
      },
      { initApp: true }
    );

    const authInfo = TESTS_USERS_STRUCTURE.BY_EMAIL["test.import@yopmail.com"];

    await AppTestHelper.authenticateStructure(authInfo, { context });

    controller = context.module.get<ImportController>(ImportController);
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it(`❌ Import d'un fichier Incorrect`, async () => {
    const importFilePath = path.resolve(importFilesDir, "import_ko_1.xlsx");

    expect(fs.existsSync(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/import/confirm", {
      headers,
      attachments: { file: importFilePath },
      context,
    });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it(`✅ Import d'un fichier Valide 1️⃣`, async () => {
    const importFilePath = path.resolve(importFilesDir, "import_ok_1.xlsx");

    expect(fs.existsSync(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/import/confirm", {
      headers,
      attachments: { file: importFilePath },
      context,
    });

    expect(response.status).toBe(HttpStatus.OK);
    expect(JSON.parse(response.text)).toEqual({
      importMode: "confirm",
      previewTable: {
        errorsCount: 0,
        isValid: true,
        rows: [],
        totalCount: 0,
      },
    });
  });

  it(`✅ Import d'un fichier Valide 2️⃣`, async () => {
    const importFilePath = path.resolve(importFilesDir, "import_ok_2.xlsx");

    expect(fs.existsSync(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/import/confirm", {
      headers,
      attachments: { file: importFilePath },
      context,
    });

    expect(response.status).toBe(HttpStatus.OK);
    expect(JSON.parse(response.text)).toEqual({
      importMode: "confirm",
      previewTable: {
        errorsCount: 0,
        isValid: true,
        rows: [],
        totalCount: 0,
      },
    });
  });

  // TODO: ajouter les test de taille limite
  // TODO: vérifier le résultat dans la BDD
});
