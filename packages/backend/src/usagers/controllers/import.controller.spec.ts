import moment = require("moment");
import { DatabaseModule } from "../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";

import { AppTestContext, AppTestHelper } from "../../util/test";

import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { UsagersProviders } from "../usagers.providers";
import { ImportController } from "./import.controller";

const REQUIRED = true;
const NOT_REQUIRED = false;
const NEXT_YEAR_MAX = true;
const THIS_YEAR_MAX = false;

describe("Import Controller", () => {
  let controller: ImportController;

  let context: AppTestContext;

  beforeAll(async () => {
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
    controller = context.module.get<ImportController>(ImportController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
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

  /*
  it("2. Check file 📝", () => {
    let file: Express.Multer.File = {};
    let res: ExpressResponse;



    const user = controller.importExcel(res, file, appAuthUserMock);
  });
  */
});
