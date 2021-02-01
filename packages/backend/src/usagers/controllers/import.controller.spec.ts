import { HttpStatus, INestApplication } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as request from "supertest";
import { DatabaseModule } from "../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { UsagersProviders } from "../usagers.providers";
import { ImportController } from "./import.controller";

import moment = require("moment");

const REQUIRED = true;
const NOT_REQUIRED = false;
const NEXT_YEAR_MAX = true;
const THIS_YEAR_MAX = false;

describe("Import Controller", () => {
  let controller: ImportController;
  let app: INestApplication;

  let authToken: string;

  let context: AppTestContext;

  beforeEach(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [ImportController],
      imports: [DatabaseModule, UsersModule, StructuresModule],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders,
      ],
    });

    app = context.module.createNestApplication();
    controller = context.module.get<ImportController>(ImportController);

    await app.init();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("return an authorization token for valid credentials", async () => {
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

  it("1. CHECK DATE FUNCTIONS 📆", () => {
    const nextYear = moment(new Date())
      .add(1, "year")
      .subtract(1, "month")
      .locale("fr")
      .format("L");

    const thisYear = moment(new Date()).locale("fr").format("L");

    const nextTwoYears = moment(new Date())
      .add(2, "year")
      .locale("fr")
      .format("L");

    // Dates REQUIRED
    expect(
      controller.isValidDate("undefined", REQUIRED, NEXT_YEAR_MAX)
    ).toBeFalsy();

    expect(controller.isValidDate(null, REQUIRED, NEXT_YEAR_MAX)).toBeFalsy();
    expect(controller.isValidDate("", REQUIRED, NEXT_YEAR_MAX)).toBeFalsy();

    // Dates -NOT- Required
    expect(
      controller.isValidDate(null, NOT_REQUIRED, THIS_YEAR_MAX)
    ).toBeTruthy();
    expect(
      controller.isValidDate("", NOT_REQUIRED, THIS_YEAR_MAX)
    ).toBeTruthy();

    // Mauvais format
    expect(
      controller.isValidDate("undefined", NOT_REQUIRED, THIS_YEAR_MAX)
    ).toBeFalsy();
    expect(
      controller.isValidDate("2019-12-10", REQUIRED, THIS_YEAR_MAX)
    ).toBeFalsy();
    expect(
      controller.isValidDate("1/00/1900", REQUIRED, THIS_YEAR_MAX)
    ).toBeFalsy();

    // ANNEE MAXIMALE
    expect(
      controller.isValidDate("20/12/2022", REQUIRED, THIS_YEAR_MAX)
    ).toBeFalsy();

    // Cette année : true & true
    expect(
      controller.isValidDate(thisYear, REQUIRED, THIS_YEAR_MAX)
    ).toBeTruthy();

    expect(
      controller.isValidDate(thisYear, REQUIRED, NEXT_YEAR_MAX)
    ).toBeTruthy();

    // Année prochaine :  true & true
    expect(
      controller.isValidDate(nextYear, REQUIRED, THIS_YEAR_MAX)
    ).toBeFalsy();

    expect(
      controller.isValidDate(nextYear, REQUIRED, NEXT_YEAR_MAX)
    ).toBeTruthy();

    // Dans deux ans : false & false
    expect(
      controller.isValidDate(nextTwoYears, REQUIRED, THIS_YEAR_MAX)
    ).toBeFalsy();

    expect(
      controller.isValidDate(nextTwoYears, REQUIRED, NEXT_YEAR_MAX)
    ).toBeFalsy();
  });

  it(`❌ Import d'un fichier Incorrect`, async (done) => {
    const validFile = "../../ressources/modele_import_domifa_errors.xlsx";
    const validFilePath = path.resolve(__dirname, validFile);

    expect(fs.existsSync(validFilePath)).toBeTruthy();

    const response = await request(app.getHttpServer())
      .post("/import")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", validFilePath)
      .expect(400);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    done();
  });

  it(`✅ Import d'un fichier Valide`, async (done) => {
    const errorFile = "../../ressources/modele_import_domifa.xlsx";
    const errorFilePath = path.resolve(__dirname, errorFile);

    expect(fs.existsSync(errorFilePath)).toBeTruthy();

    const response = await request(app.getHttpServer())
      .post("/import")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", errorFilePath)
      .expect(200);

    expect(response.status).toBe(HttpStatus.OK);
    expect(JSON.parse(response.text)).toEqual({ success: true });
    done();
  });
});
