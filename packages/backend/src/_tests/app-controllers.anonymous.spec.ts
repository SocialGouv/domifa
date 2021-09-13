import { HttpStatus } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { StatsPrivateController } from "../stats/controllers/stats.private.controller";
import { StatsPublicController } from "../stats/controllers/stats.public.controller";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersController } from "../usagers/controllers/usagers.controller";
import { CerfaService } from "../usagers/services/cerfa.service";
import { DocumentsService } from "../usagers/services/documents.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { AppTestHttpClient } from "../util/test/AppTestHttpClient.service";

const importFilesDir = path.resolve(
  __dirname,
  "../_static/usagers-import-test"
);

const TEST_BASENAME = "Anonymous";

describe(`App controllers security - ${TEST_BASENAME}`, () => {
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [
          UsagersController,
          StatsPublicController,
          StatsPrivateController,
        ],
        imports: [UsersModule, StructuresModule, StatsModule],
        providers: [CerfaService, UsagersService, DocumentsService],
      },
      { initApp: true }
    );
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it(`[${TEST_BASENAME}] UsagersController.findAllByStructure`, async () => {
    const response = await AppTestHttpClient.get("/usagers", {
      context,
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] UsagersController.isDoublon`, async () => {
    const response = await AppTestHttpClient.get(
      "/usagers/doublon/nom/prenom/4",
      {
        context,
      }
    );
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] UsagersController.editPreference`, async () => {
    const response = await AppTestHttpClient.post("/usagers/preference/4", {
      context,
      body: {
        phone: false,
        phoneNumber: "00-00-00-00-00",
        email: false,
      },
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] StatsPublicController.home`, async () => {
    const response = await AppTestHttpClient.get("/stats/home-stats", {
      context,
    });
    expect(response.status).toBe(HttpStatus.OK);
  });
  it(`[${TEST_BASENAME}] StatsPublicController.home`, async () => {
    const response = await AppTestHttpClient.get("/stats/public-stats/52", {
      context,
    });
    expect(response.status).toBe(HttpStatus.OK);
  });
  it(`[${TEST_BASENAME}] StatsPrivateController.exportByDate`, async () => {
    const response = await AppTestHttpClient.post("/stats/export", {
      context,
      body: {
        start: "2021-03-31T14:32:22Z",
        end: "2021-04-31T14:32:22Z",
        structureId: 1,
      },
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] StatsPrivateController.getByDate`, async () => {
    const response = await AppTestHttpClient.post("/stats", {
      context,
      body: {
        start: "2021-03-31T14:32:22Z",
        end: "2021-04-31T14:32:22Z",
        structureId: 1,
      },
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] StructureDocController.getStructureDocs`, async () => {
    const response = await AppTestHttpClient.get("/structure-docs", {
      context,
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] AgendaController.getAll`, async () => {
    const response = await AppTestHttpClient.get("/agenda", {
      context,
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] AgendaController.getUsersMeeting`, async () => {
    const response = await AppTestHttpClient.get("/agenda/users", {
      context,
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] DocsController.getDocument`, async () => {
    const response = await AppTestHttpClient.get("/docs/1/0", {
      context,
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] UsagerStructureDocsController.getDocument`, async () => {
    const response = await AppTestHttpClient.get(
      "/usagers-structure-docs/1/xxx",
      {
        context,
      }
    );
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it(`[${TEST_BASENAME}] ImportController.importExcel (fichier incorrect)`, async () => {
    const importFilePath = path.resolve(importFilesDir, "import_ko_1.xlsx");

    expect(fs.existsSync(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/import/confirm", {
      headers,
      attachments: { file: importFilePath },
      context,
    });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] ExportStructureUsagersController.export`, async () => {
    const response = await AppTestHttpClient.get("/export", {
      context,
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it(`[${TEST_BASENAME}] UsersPublicController.validateEmail`, async () => {
    const response = await AppTestHttpClient.post("/users/validate-email", {
      context,
      body: {
        email: "xxx",
      },
    });
    expect(response.status).toBe(HttpStatus.OK);
  });
  it(`[${TEST_BASENAME}] UsersController.getUsers`, async () => {
    const response = await AppTestHttpClient.get("/users", {
      context,
    });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
