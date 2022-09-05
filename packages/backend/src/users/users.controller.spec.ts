import { HttpModule } from "@nestjs/axios";

import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UsersController } from "./users.controller";
import { AppTestHttpClient } from "../util/test";
import { userMock } from "../_common/mocks";
import { TESTS_USERS_STRUCTURE } from "../_tests";
import { usersDeletor } from "./services/users-deletor.service";

describe("Users Controller", () => {
  let controller: UsersController;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersController],
      imports: [MailsModule, StructuresModule, UsagersModule, HttpModule],
      providers: [],
    });

    const authInfo = TESTS_USERS_STRUCTURE.BY_EMAIL["s1-admin@yopmail.com"];

    await AppTestHelper.authenticateStructure(authInfo, { context });

    controller = context.module.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    await usersDeletor.deleteUserByEmail("test@test.com");
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(controller).toBeDefined();
  });

  describe("> Register un user structure", () => {
    it("should throw 400 when email already exist", async () => {
      const response = await AppTestHttpClient.post("/users/register", {
        context,
        body: userMock,
      });

      expect(response.status).toBe(400);
      expect(response.text).toBe('{"message":"EMAIL_EXIST"}');
    });

    it("should be 200", async () => {
      const response = await AppTestHttpClient.post("/users/register", {
        context,
        body: {
          ...userMock,
          email: "test@test.com",
          structureId: 1,
          structure: { ...userMock.structure, id: 1 },
        },
      });

      expect(response.status).toBe(200);
      expect(response.text).toBe('{"message":"OK"}');
    });
  });
});
