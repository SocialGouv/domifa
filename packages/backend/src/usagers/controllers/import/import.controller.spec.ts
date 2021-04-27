import { HttpStatus, INestApplication } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as request from "supertest";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { CerfaService } from "../../services/cerfa.service";
import { DocumentsService } from "../../services/documents.service";
import { UsagersService } from "../../services/usagers.service";
import { ImportController } from "./import.controller";

import moment = require("moment");

const importFilesDir = path.resolve(
  __dirname,
  "../../../_static/usagers-import-test"
);

const REQUIRED = true;
const NOT_REQUIRED = false;

describe("Import Controller", () => {
  let controller: ImportController;
  let app: INestApplication;

  let authToken: string;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [ImportController],
      imports: [UsersModule, StructuresModule],
      providers: [CerfaService, UsagersService, DocumentsService],
    });

    app = context.module.createNestApplication();
    controller = context.module.get<ImportController>(ImportController);

    await app.init();

    const authInfo = {
      email: "test.import@yopmail.com",
      password: "Azerty012345",
    };
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send(authInfo);
    expect(response.status).toBe(HttpStatus.OK);
    authToken = response.body.access_token;
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it(`❌ Import d'un fichier Incorrect`, async (done) => {
    const importFilePath = path.resolve(importFilesDir, "import_ko_1.xlsx");

    expect(fs.existsSync(importFilePath)).toBeTruthy();

    const response = await request(app.getHttpServer())
      .post("/import/confirm")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", importFilePath)
      .expect(400);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    done();
  });

  it(`✅ Import d'un fichier Valide 1️⃣`, async (done) => {
    const importFilePath = path.resolve(importFilesDir, "import_ok_1.xlsx");

    expect(fs.existsSync(importFilePath)).toBeTruthy();

    const response = await request(app.getHttpServer())
      .post("/import/confirm")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", importFilePath)
      .expect(200);

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
    done();
  });

  it(`✅ Import d'un fichier Valide 2️⃣`, async (done) => {
    const importFilePath = path.resolve(importFilesDir, "import_ok_2.xlsx");

    expect(fs.existsSync(importFilePath)).toBeTruthy();

    const response = await request(app.getHttpServer())
      .post("/import/confirm")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", importFilePath)
      .expect(200);

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
    done();
  });

  // TODO: ajouter les test de taille limite
  // TODO: vérufier le résultat dans la BDD
});
