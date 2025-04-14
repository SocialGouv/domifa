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
    it("should be defined", async () => {
      expect(controller).toBeDefined();
    });

    it("should throw 400 when email already exist", async () => {
      const response = await AppTestHttpClient.post("/users/register", {
        context,
        body: POST_USER_STRUCTURE_BODY,
      });

      expect(response.status).toBe(400);
      expect(response.text).toBe('{"message":"EMAIL_EXIST"}');
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
});
