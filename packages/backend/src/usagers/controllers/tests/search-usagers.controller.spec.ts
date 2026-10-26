import { SearchUsagersController } from "../search-usagers.controller";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { UsersModule } from "../../../modules/users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { UsagersModule } from "../../usagers.module";
import { CriteriaSearchField } from "@domifa/common";
import { usagerRepository } from "../../../database";

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

  it("should find a radie whatever the order of the words", async () => {
    const response = await AppTestHttpClient.post(
      "/search-usagers/search-radies",
      {
        context,
        body: {
          searchString: "lisa loumiel",
          searchStringField: CriteriaSearchField.DEFAULT,
        },
      }
    ).expect(201);
    expect(response.body.map((usager) => usager.nom)).toEqual(["Loumiel"]);
  });

  it("should return the server time with the full load", async () => {
    const response = await AppTestHttpClient.get(
      "/search-usagers?chargerTousRadies=false",
      { context }
    ).expect(200);
    expect(Number.isNaN(Date.parse(response.body.syncedAt))).toBe(false);
  });

  it("should return every usager updated since lastSync", async () => {
    const lastSync = new Date().toISOString();
    await usagerRepository.update(
      { ref: 4, structureId: 1 },
      { updatedAt: new Date() }
    );

    const response = await AppTestHttpClient.get(
      `/search-usagers/update-manage?since=${lastSync}`,
      { context }
    ).expect(200);
    expect(response.body.map((usager) => usager.ref)).toContain(4);
    for (const usager of response.body) {
      expect(usager.updatedAt).toBeDefined();
      for (const decision of usager.historique ?? []) {
        expect(
          Object.keys(decision).every((key) =>
            ["statut", "dateDecision", "dateDebut", "dateFin"].includes(key)
          )
        ).toBe(true);
      }
    }
  });

  it.each([
    "hier",
    "2026-10-27",
    "2026-10-27T10:00",
    "2026-10-27T10:00:00",
    "20261027T100000Z",
    "2026-02-30T10:00:00Z",
  ])("should reject lastSync %s", async (since) => {
    await AppTestHttpClient.get(
      `/search-usagers/update-manage?since=${encodeURIComponent(since)}`,
      { context }
    ).expect(400);
  });

  it("should accept lastSync with a time zone offset", async () => {
    await AppTestHttpClient.get(
      `/search-usagers/update-manage?since=${encodeURIComponent(
        "2026-10-27T10:00:00+02:00"
      )}`,
      { context }
    ).expect(200);
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
