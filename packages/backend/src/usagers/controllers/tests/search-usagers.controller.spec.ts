import { SearchUsagersController } from "../search-usagers.controller";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { UsersModule } from "../../../users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { UsagersModule } from "../../usagers.module";
import { CriteriaSearchField } from "@domifa/common";

describe("SearchUsagersController", () => {
  let controller: SearchUsagersController;
  let context: AppTestContext;

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [SearchUsagersController],
        imports: [UsagersModule, UsersModule],
      },
      { initApp: true }
    );

    const authInfo =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    await AppTestHelper.authenticateStructure(authInfo, { context });

    controller = context.module.get<SearchUsagersController>(
      SearchUsagersController
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should search with all parameters", async () => {
    const response = await AppTestHttpClient.post(
      "/search-usagers/search-radies",
      {
        context,
        body: {
          searchString: "dupuis",
          searchStringField: CriteriaSearchField.DEFAULT,
          echeance: "NEXT_TWO_WEEKS",
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
          entretien: "COMING",
          referrerId: 42,
        },
      }
    ).expect(201);

    expect(response.body).toBeDefined();
  });

  it("should search with null referrerId", async () => {
    const response = await AppTestHttpClient.post(
      "/search-usagers/search-radies",
      {
        context,
        body: {
          searchString: " DIé",
          searchStringField: CriteriaSearchField.DEFAULT,
          referrerId: null,
        },
      }
    ).expect(201);
    expect(response.body).toBeDefined();
    expect(response.body.length).toEqual(1);
    expect(response.body[0].nom).toEqual("Rara");
  });

  it("should handle phone number search", async () => {
    const response = await AppTestHttpClient.post(
      "/search-usagers/search-radies",
      {
        context,
        body: {
          searchString: "06.   06-06/06-06",
          searchStringField: CriteriaSearchField.PHONE_NUMBER,
        },
      }
    ).expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.length).toEqual(1);
    expect(response.body[0].nom).toEqual("Loumiel");
  });

  it("should handle birth date search", async () => {
    const response = await AppTestHttpClient.post(
      "/search-usagers/search-radies",
      {
        context,
        body: {
          searchString: "18/04/1990",
          searchStringField: CriteriaSearchField.BIRTH_DATE,
        },
      }
    ).expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.length).toEqual(1);
    expect(response.body[0].nom).toEqual("Loumiel");
  });

  it("should reject invalid birth date", async () => {
    await AppTestHttpClient.post("/search-usagers/search-radies", {
      context,
      body: {
        searchString: "32/13/1999",
        searchStringField: CriteriaSearchField.BIRTH_DATE,
      },
    }).expect(400);
  });

  it("should reject invalid echeance value", async () => {
    await AppTestHttpClient.post("/search-usagers/search-radies", {
      context,
      body: {
        searchString: "dupuis",
        searchStringField: CriteriaSearchField.DEFAULT,
        echeance: "INVALID_VALUE",
      },
    }).expect(400);
  });
});
