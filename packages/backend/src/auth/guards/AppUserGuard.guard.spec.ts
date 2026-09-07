import { HttpStatus } from "@nestjs/common";

import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../util/test";
import { SECURITY_TESTS_NEST_MODULE } from "../../_tests/SECURITY_TESTS_NEST_MODULE.const";
import { TESTS_USERS_ADMIN, TESTS_USERS_STRUCTURE } from "../../_tests";
import {
  userStructureRepository,
  userSupervisorRepository,
} from "../../database";
import { passwordGenerator } from "../../util";

// Server-side enforcement of the annual password-renewal policy
// (getPasswordChangeStatus === "EXPIRED"), added to AppUserGuard after a
// security review found the check only ever ran in the Angular guard — a
// direct API call (curl, a replayed JWT) bypassed it entirely even though
// the JWT was otherwise perfectly valid.
describe("AppUserGuard > password renewal enforcement", () => {
  let context: AppTestContext;

  const STRUCTURE_FIXTURE =
    TESTS_USERS_STRUCTURE.BY_EMAIL["s3-admin@yopmail.com"];
  // The only supervisor fixture in the whole test suite — every sub-test
  // restores its passwordLastUpdate (and password hash, where changed)
  // before finishing, regardless of outcome.
  const SUPERVISOR_FIXTURE =
    TESTS_USERS_ADMIN.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(SECURITY_TESTS_NEST_MODULE, {
      initApp: true,
    });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  async function setStructurePasswordLastUpdate(date: Date): Promise<void> {
    await userStructureRepository.update(
      { id: STRUCTURE_FIXTURE.id },
      { passwordLastUpdate: date }
    );
  }

  async function setSupervisorPasswordLastUpdate(date: Date): Promise<void> {
    await userSupervisorRepository.update(
      { id: SUPERVISOR_FIXTURE.id },
      { passwordLastUpdate: date }
    );
  }

  describe("> structure profile", () => {
    afterEach(async () => {
      // Keep the shared fixture usable by every other suite that reuses it.
      await setStructurePasswordLastUpdate(new Date());
    });

    it("blocks a regular endpoint once the password is EXPIRED", async () => {
      await setStructurePasswordLastUpdate(new Date("2000-01-01"));
      await AppTestHelper.authenticateStructure(STRUCTURE_FIXTURE, {
        context,
      });

      const response = await AppTestHttpClient.get("/users", { context });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe("PASSWORD_RENEWAL_REQUIRED");
    });

    it("does not block a regular endpoint for a fresh password", async () => {
      await setStructurePasswordLastUpdate(new Date());
      await AppTestHelper.authenticateStructure(STRUCTURE_FIXTURE, {
        context,
      });

      const response = await AppTestHttpClient.get("/users", { context });

      expect(response.status).toBe(HttpStatus.OK);
    });

    it("still allows GET structures/auth/me once the password is EXPIRED", async () => {
      await setStructurePasswordLastUpdate(new Date("2000-01-01"));
      await AppTestHelper.authenticateStructure(STRUCTURE_FIXTURE, {
        context,
      });

      const response = await AppTestHttpClient.get("/structures/auth/me", {
        context,
      });

      expect(response.status).toBe(HttpStatus.OK);
    });

    it("still allows edit-my-password once the password is EXPIRED", async () => {
      const NEW_PASSWORD = "GuardTestPass1!";
      try {
        await setStructurePasswordLastUpdate(new Date("2000-01-01"));
        await AppTestHelper.authenticateStructure(STRUCTURE_FIXTURE, {
          context,
        });

        const response = await AppTestHttpClient.post(
          "/users/edit-my-password",
          {
            context,
            body: {
              oldPassword: STRUCTURE_FIXTURE.password,
              password: NEW_PASSWORD,
              passwordConfirmation: NEW_PASSWORD,
            },
          }
        );

        expect(response.status).toBe(HttpStatus.OK);
      } finally {
        const hash = await passwordGenerator.generatePasswordHash({
          password: STRUCTURE_FIXTURE.password,
        });
        await userStructureRepository.update(
          { id: STRUCTURE_FIXTURE.id },
          { password: hash }
        );
      }
    });
  });

  describe("> supervisor profile", () => {
    afterEach(async () => {
      await setSupervisorPasswordLastUpdate(new Date());
    });

    it("blocks a regular endpoint once the password is EXPIRED", async () => {
      await setSupervisorPasswordLastUpdate(new Date("2000-01-01"));
      await AppTestHelper.authenticateSupervisor(SUPERVISOR_FIXTURE, {
        context,
      });

      const response = await AppTestHttpClient.get("/admin/users", {
        context,
      });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe("PASSWORD_RENEWAL_REQUIRED");
    });

    it("still allows GET portail-admins/auth/me once the password is EXPIRED", async () => {
      await setSupervisorPasswordLastUpdate(new Date("2000-01-01"));
      await AppTestHelper.authenticateSupervisor(SUPERVISOR_FIXTURE, {
        context,
      });

      const response = await AppTestHttpClient.get("/portail-admins/auth/me", {
        context,
      });

      expect(response.status).toBe(HttpStatus.OK);
    });

    it("still allows edit-my-password once the password is EXPIRED", async () => {
      const NEW_PASSWORD = "GuardTestPass1!";
      try {
        await setSupervisorPasswordLastUpdate(new Date("2000-01-01"));
        await AppTestHelper.authenticateSupervisor(SUPERVISOR_FIXTURE, {
          context,
        });

        const response = await AppTestHttpClient.post(
          "/users-supervisor/edit-my-password",
          {
            context,
            body: {
              oldPassword: SUPERVISOR_FIXTURE.password,
              password: NEW_PASSWORD,
              passwordConfirmation: NEW_PASSWORD,
            },
          }
        );

        expect(response.status).toBe(HttpStatus.OK);
      } finally {
        const hash = await passwordGenerator.generatePasswordHash({
          password: SUPERVISOR_FIXTURE.password,
        });
        await userSupervisorRepository.update(
          { id: SUPERVISOR_FIXTURE.id },
          { password: hash }
        );
      }
    });
  });
});
