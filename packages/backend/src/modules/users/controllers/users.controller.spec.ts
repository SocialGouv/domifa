import {
  POST_USER_STRUCTURE_BODY_WITHOUT_FONCTION,
  POST_USER_STRUCTURE_BODY_WITHOUT_FONCTION_AUTRE_WITHOUT_DETAIL,
} from "../../../_common/mocks/POST_USER_STRUCTURE_BODY_WITH_MISSING_ATTRIBUTES.mock";
import { HttpModule } from "@nestjs/axios";

import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../../usagers/usagers.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { UsersController } from "./users.controller";
import { POST_USER_STRUCTURE_BODY } from "../../../_common/mocks";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { usersDeletor } from "../services/users-deletor.service";
import { MailsModule } from "../../mails/mails.module";

describe("Users Controller", () => {
  let controller: UsersController;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersController],
      imports: [MailsModule, StructuresModule, UsagersModule, HttpModule],
    });

    const authInfo =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    await AppTestHelper.authenticateStructure(authInfo, { context });
    controller = context.module.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    await usersDeletor.deleteUserByEmail("test@test.com");
    await AppTestHelper.tearDownTestApp(context);
  });

  describe("> Register user", () => {
    describe("Nominal case", () => {
      it("should be defined", async () => {
        expect(controller).toBeDefined();
      });

      it("should be 200", async () => {
        const response = await AppTestHttpClient.post("/users/register", {
          context,
          body: {
            ...POST_USER_STRUCTURE_BODY,
            email: "test@test.com",
            structureId: 1,
            structure: { ...POST_USER_STRUCTURE_BODY.structure, id: 1 },
          },
        });

        expect(response.status).toBe(200);
        expect(response.text).toBe('{"message":"OK"}');
      });
    });

    describe("Edge case", () => {
      it("should throw 400 when email already exist", async () => {
        const response = await AppTestHttpClient.post("/users/register", {
          context,
          body: POST_USER_STRUCTURE_BODY,
        });

        expect(response.status).toBe(400);
        expect(response.text).toBe('{"message":"EMAIL_EXIST"}');
      });

      it("should shoud throw 401 when fonction is missing", async () => {
        const response = await AppTestHttpClient.post("/users/register", {
          context,
          body: {
            ...POST_USER_STRUCTURE_BODY_WITHOUT_FONCTION,
            email: "test@test.com",
            structureId: 1,
            structure: { ...POST_USER_STRUCTURE_BODY.structure, id: 1 },
          },
        });

        expect(response.status).toBe(400);
      });

      it("should shoud throw 401 when fonction is Autre and detail is missing", async () => {
        const response = await AppTestHttpClient.post("/users/register", {
          context,
          body: {
            ...POST_USER_STRUCTURE_BODY_WITHOUT_FONCTION_AUTRE_WITHOUT_DETAIL,
            email: "test@test.com",
            structureId: 1,
            structure: { ...POST_USER_STRUCTURE_BODY.structure, id: 1 },
          },
        });

        expect(response.status).toBe(400);
      });
    });
  });
});
