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
      email: "ccastest@yopmail.com",
      password: "Azerty012345",
    };
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send(authInfo);

    expect(response.status).toBe(HttpStatus.OK);
    authToken = response.body.access_token;
  });

  it("1. CHECK DATE FUNCTIONS 📆", () => {
    const minDate = moment
      .utc("01/01/1900", "DD/MM/YYYY")
      .endOf("day")
      .toDate();

    const today = moment.utc().endOf("day").toDate();
    const nextYear = moment.utc().add(1, "year").endOf("day").toDate();
    const nextYearString = moment
      .utc()
      .add(1, "year")
      .subtract(1, "month")
      .locale("fr")
      .format("L");

    const thisYear = moment.utc().locale("fr").format("L");

    const nextTwoYears = moment.utc().add(2, "year").locale("fr").format("L");

    // Dates REQUIRED
    expect(
      controller.isValidDate("undefined", {
        required: REQUIRED,
        minDate,
        maxDate: nextYear,
      })
    ).toBeFalsy();

    expect(
      controller.isValidDate(null, {
        required: REQUIRED,
        minDate,
        maxDate: nextYear,
      })
    ).toBeFalsy();
    expect(
      controller.isValidDate("", {
        required: REQUIRED,
        minDate,
        maxDate: nextYear,
      })
    ).toBeFalsy();

    // Dates -NOT- Required
    expect(
      controller.isValidDate(null, {
        required: NOT_REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeTruthy();
    expect(
      controller.isValidDate("", {
        required: NOT_REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeTruthy();

    // Mauvais format
    expect(
      controller.isValidDate("undefined", {
        required: NOT_REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeFalsy();
    expect(
      controller.isValidDate("2019-12-10", {
        required: REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeFalsy();
    expect(
      controller.isValidDate("1/00/1900", {
        required: REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeFalsy();

    // ANNEE MAXIMALE
    expect(
      controller.isValidDate("20/12/2022", {
        required: REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeFalsy();

    // Cette année : true & true
    expect(
      controller.isValidDate(thisYear, {
        required: REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeTruthy();

    expect(
      controller.isValidDate(thisYear, {
        required: REQUIRED,
        minDate,
        maxDate: nextYear,
      })
    ).toBeTruthy();

    // Année prochaine :  true & true
    expect(
      controller.isValidDate(nextYearString, {
        required: REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeFalsy();

    expect(
      controller.isValidDate(nextYearString, {
        required: REQUIRED,
        minDate,
        maxDate: nextYear,
      })
    ).toBeTruthy();

    // Dans deux ans : false & false
    expect(
      controller.isValidDate(nextTwoYears, {
        required: REQUIRED,
        minDate,
        maxDate: today,
      })
    ).toBeFalsy();

    expect(
      controller.isValidDate(nextTwoYears, {
        required: REQUIRED,
        minDate,
        maxDate: nextYear,
      })
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

  it(`✅ Import d'un fichier Valide 1️⃣`, async (done) => {
    const errorFile = "../../ressources/imports_tests/import_ok_1.xlsx";
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

  it(`✅ Import d'un fichier Valide 2️⃣`, async (done) => {
    const errorFile = "../../ressources/imports_tests/import_ok_2.xlsx";
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

  // TODO: ajouter les test de taille limite
  // TODO: vérufier le résultat dans la BDD
});
