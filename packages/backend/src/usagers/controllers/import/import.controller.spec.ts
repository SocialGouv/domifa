import { FailedUsagerImportLogContext } from "./../../../modules/app-logs/app-log-context.types";
import { HttpStatus } from "@nestjs/common";

import { pathExists } from "fs-extra";
import { resolve } from "path";

import { StructuresModule } from "../../../modules/structures/structure.module";
import { UsersModule } from "../../../modules/users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { TESTS_USERS_STRUCTURE, TestUserStructure } from "../../../_tests";

import { UsagersService } from "../../services/usagers.service";
import { ImportController } from "./import.controller";
import { UsagerHistoryStateService } from "../../services/usagerHistoryState.service";
import { UsagersModule } from "../../usagers.module";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { AppLog } from "../../../_common/model";

const importFilesDir = resolve(
  __dirname,
  "../../../_static/usagers-import-test"
);

describe("Import Controller", () => {
  let controller: ImportController;
  let appLogService: AppLogsService;

  let context: AppTestContext;
  let authInfo: TestUserStructure;
  beforeAll(async () => {
    appLogService = {
      create: jest.fn(),
    };
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [ImportController],
        imports: [UsersModule, StructuresModule, UsagersModule],
        providers: [
          UsagersService,
          UsagerHistoryStateService,
          {
            provide: AppLogsService,
            useValue: appLogService,
          },
        ],
      },
      { initApp: true }
    );

    authInfo = TESTS_USERS_STRUCTURE.BY_EMAIL["s3-admin@yopmail.com"];

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
    const expectedLogContextEntree: FailedUsagerImportLogContext = {
      nombreActifs: 0,
      nombreErreurs: 5,
      nombreTotal: 2,
    };

    const expectedLog: AppLog = {
      userId: authInfo.id,
      context: expectedLogContextEntree,
      action: "IMPORT_USAGERS_FAILED",
    };

    const importFilePath = resolve(importFilesDir, "import_ko_1.xlsx");

    expect(await pathExists(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/import/confirm", {
      headers,
      attachments: { file: importFilePath },
      context,
    });

    expect(appLogService.create).toHaveBeenCalledWith(expectedLog);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it(`✅ Import d'un fichier Valide 1️⃣`, async () => {
    const importFilePath = resolve(importFilesDir, "import_ok_1.xlsx");

    expect(await pathExists(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/import/confirm", {
      headers,
      attachments: { file: importFilePath },
      context,
    });
    expect(appLogService.create).toHaveBeenCalledWith({
      action: "IMPORT_USAGERS_SUCCESS",
      context: {
        nombreActifs: 19,
        nombreTotal: 0,
      },
      userId: authInfo.id,
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
    const importFilePath = resolve(importFilesDir, "import_ok_2.xlsx");

    expect(await pathExists(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/import/confirm", {
      headers,
      attachments: { file: importFilePath },
      context,
    });
    expect(appLogService.create).toHaveBeenCalledWith({
      action: "IMPORT_USAGERS_SUCCESS",
      context: {
        nombreActifs: 2,
        nombreTotal: 0,
      },
      userId: authInfo.id,
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
});
