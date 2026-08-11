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
import { TESTS_USERS_STRUCTURE, TestUserStructure } from "../../../_tests";
import { MailsModule } from "../../mails/mails.module";
import { AppLogsService } from "../../app-logs/app-logs.service";
import {
  appLogSecurityRepository,
  appLogsRepository,
  userStructureRepository,
} from "../../../database";
import { OtpModule } from "../../otp/otp.module";
import { UserStructureDecisionService } from "../services/user-structure-decision/user-structure-decision.service";
import { UserStructureEmailUpdaterService } from "../services/userStructureEmailUpdater.service";
import { passwordGenerator } from "../../../util";

describe("Users Controller", () => {
  let controller: UsersController;
  let context: AppTestContext;
  let authInfo: TestUserStructure;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersController],
      // OtpModule needed because UsersController has methods decorated with
      // `@UseGuards(OtpGuard)`; Nest resolves the guard's deps (OtpService)
      // at module compile time even when the protected routes aren't tested.
      imports: [
        MailsModule,
        StructuresModule,
        UsagersModule,
        HttpModule,
        OtpModule,
      ],
      providers: [
        AppLogsService,
        UserStructureDecisionService,
        UserStructureEmailUpdaterService,
      ],
    });

    authInfo =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    await AppTestHelper.authenticateStructure(authInfo, { context });
    controller = context.module.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    await userStructureRepository.deleteWithSecurityByEmail("test@test.com");
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeEach(async () => {
    await appLogsRepository.delete({
      userId: authInfo.id,
      action: "USER_CREATE",
    });
  });

  describe("> Register user", () => {
    describe("Nominal case", () => {
      it("should be defined", async () => {
        expect(controller).toBeDefined();
      });

      it("should be 200", async () => {
        const structureAffectationId = 1;
        const response = await AppTestHttpClient.post("/users/register", {
          context,
          body: {
            ...POST_USER_STRUCTURE_BODY,
            email: "test@test.com",
            structureId: 1,
            structure: {
              ...POST_USER_STRUCTURE_BODY.structure,
              id: structureAffectationId,
            },
          },
        });
        const logs = await appLogsRepository.find({
          where: {
            role: authInfo.role,
            structureId: authInfo.structureId,
            userId: authInfo.id,
            action: "USER_CREATE",
          },
        });
        expect(logs.length).toEqual(1);
        // as the userId is generated, we check only other fields
        expect({
          userId: logs[0].userId,
          structureId: logs[0].structureId,
          role: logs[0].role,
          action: logs[0].action,
          context: {
            role: logs[0].context.role,
            structureId: logs[0].context.structureId,
          },
        }).toEqual({
          userId: authInfo.id,
          structureId: authInfo.structureId,
          role: authInfo.role,
          action: "USER_CREATE",
          context: {
            role: POST_USER_STRUCTURE_BODY.role,
            structureId: structureAffectationId,
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
        expect(response.text).toBe('{"message":"BAD_REQUEST"}');
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

  describe("> Edit my password", () => {
    // Dedicated fixtures, not shared with any other suite: this endpoint
    // changes the stored password hash and terminates the session, so we
    // don't want to mutate `authInfo` (reused by other suites relying on
    // its known fixture password). AppTestHelper.bootstrapTestApp freshens
    // every fixture's passwordLastUpdate at suite start (see
    // freshenAllPasswordDates), so FRESH_PASSWORD_STRUCTURE stays "OK" by
    // default; STALE_PASSWORD_STRUCTURE is deliberately pushed back to
    // verify the overdue-renewal branch of the same endpoint.
    const FRESH_PASSWORD_STRUCTURE =
      TESTS_USERS_STRUCTURE.BY_EMAIL["s4-admin@yopmail.com"];
    const STALE_PASSWORD_STRUCTURE =
      TESTS_USERS_STRUCTURE.BY_EMAIL["s5-admin@yopmail.com"];
    const NEW_PASSWORD = "NouveauPass123!";

    async function restoreFixturePassword(
      fixture: TestUserStructure
    ): Promise<void> {
      const hash = await passwordGenerator.generatePasswordHash({
        password: fixture.password,
      });
      await userStructureRepository.update(
        { id: fixture.id },
        { password: hash }
      );
    }

    it("should log CHANGE_PASSWORD_SUCCESS for a regular (fresh) account", async () => {
      try {
        await AppTestHelper.authenticateStructure(FRESH_PASSWORD_STRUCTURE, {
          context,
        });

        const response = await AppTestHttpClient.post(
          "/users/edit-my-password",
          {
            context,
            body: {
              oldPassword: FRESH_PASSWORD_STRUCTURE.password,
              password: NEW_PASSWORD,
              passwordConfirmation: NEW_PASSWORD,
            },
          }
        );
        expect(response.status).toBe(200);

        // applyNewPassword logs the success action, then terminateUserSession
        // logs its own LOGOUT entry right after — filter on the action
        // instead of assuming ordering.
        const logs = await appLogSecurityRepository.find({
          where: {
            userStructureId: FRESH_PASSWORD_STRUCTURE.id,
            action: "CHANGE_PASSWORD_SUCCESS",
          },
        });
        expect(logs.length).toBeGreaterThan(0);
      } finally {
        await restoreFixturePassword(FRESH_PASSWORD_STRUCTURE);
      }
    });

    it("should log RESET_OUTDATED_PASSWORD_SUCCESS when the current password is overdue", async () => {
      try {
        await AppTestHelper.authenticateStructure(STALE_PASSWORD_STRUCTURE, {
          context,
        });
        await userStructureRepository.update(
          { id: STALE_PASSWORD_STRUCTURE.id },
          { passwordLastUpdate: new Date("2000-01-01") }
        );

        const response = await AppTestHttpClient.post(
          "/users/edit-my-password",
          {
            context,
            body: {
              oldPassword: STALE_PASSWORD_STRUCTURE.password,
              password: NEW_PASSWORD,
              passwordConfirmation: NEW_PASSWORD,
            },
          }
        );
        expect(response.status).toBe(200);

        const logs = await appLogSecurityRepository.find({
          where: {
            userStructureId: STALE_PASSWORD_STRUCTURE.id,
            action: "RESET_OUTDATED_PASSWORD_SUCCESS",
          },
        });
        expect(logs.length).toBeGreaterThan(0);
      } finally {
        await restoreFixturePassword(STALE_PASSWORD_STRUCTURE);
      }
    });

    it("should reject a new password identical to the current one", async () => {
      try {
        await AppTestHelper.authenticateStructure(FRESH_PASSWORD_STRUCTURE, {
          context,
        });

        const response = await AppTestHttpClient.post(
          "/users/edit-my-password",
          {
            context,
            body: {
              oldPassword: FRESH_PASSWORD_STRUCTURE.password,
              password: FRESH_PASSWORD_STRUCTURE.password,
              passwordConfirmation: FRESH_PASSWORD_STRUCTURE.password,
            },
          }
        );
        expect(response.status).toBe(400);
        expect(response.text).toBe(`{"message":"NEW_PASSWORD_SAME_AS_OLD"}`);
      } finally {
        await restoreFixturePassword(FRESH_PASSWORD_STRUCTURE);
      }
    });
  });
});
