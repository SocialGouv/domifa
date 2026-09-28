import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { SECURITY_TESTS_NEST_MODULE } from "../../../_tests/SECURITY_TESTS_NEST_MODULE.const";
import { TESTS_USERS_ADMIN, TESTS_USERS_STRUCTURE } from "../../../_tests";
import {
  userStructureRepository,
  userStructureSecurityRepository,
  userSupervisorRepository,
  userSupervisorSecurityRepository,
} from "../../../database";
import { passwordGenerator } from "../../../util";

// End-to-end walk-through of the whole password-renewal-after-inactivity
// feature, exercised over real HTTP calls (supertest) rather than unit-level
// service/guard assertions — each step is what a real client would actually
// do: log in with a stale password, get blocked, renew, and come back in.
describe("Password renewal — end to end", () => {
  let context: AppTestContext;

  const STRUCTURE_FIXTURE =
    TESTS_USERS_STRUCTURE.BY_EMAIL["s3-gestionnaire@yopmail.com"];
  // The only supervisor fixture in the whole test suite (see
  // AppUserGuard.guard.spec.ts) — restored to its known password and a
  // fresh passwordLastUpdate before finishing, regardless of outcome.
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

  it("structure: EXPIRED password blocks the account, renewing it lifts the block and the old password stops working", async () => {
    const NEW_PASSWORD = "E2ERenewalPass1!";
    try {
      // 1. The account is more than 36 months overdue.
      await userStructureRepository.update(
        { id: STRUCTURE_FIXTURE.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );

      // 2. Login still succeeds — a stale password doesn't lock the account
      // out, it restricts what the (still valid) session can do.
      const loginRes = await supertest(context.app.getHttpServer())
        .post("/structures/auth/login")
        .send({
          email: STRUCTURE_FIXTURE.email,
          password: STRUCTURE_FIXTURE.password,
        });
      expect(loginRes.status).toBe(HttpStatus.OK);
      const staleToken = loginRes.body.access_token as string;
      expect(staleToken).toBeTruthy();

      // 3. A regular endpoint is blocked with that token.
      const blockedRes = await supertest(context.app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(blockedRes.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(blockedRes.body.message).toBe("PASSWORD_RENEWAL_REQUIRED");

      // 4. /me stays reachable — the frontend needs it on every navigation,
      // including the one to the renewal page itself.
      const meRes = await supertest(context.app.getHttpServer())
        .get("/structures/auth/me")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(meRes.status).toBe(HttpStatus.OK);

      // 5. Renewing the password with that same (still valid) session works.
      const renewRes = await supertest(context.app.getHttpServer())
        .post("/users/edit-my-password")
        .set("Authorization", `Bearer ${staleToken}`)
        .send({
          oldPassword: STRUCTURE_FIXTURE.password,
          password: NEW_PASSWORD,
          passwordConfirmation: NEW_PASSWORD,
        });
      expect(renewRes.status).toBe(HttpStatus.OK);

      // 6. The session is never killed by the renewal — the guard re-checks
      // passwordLastUpdate live on every request, so the very same token
      // that was blocked a moment ago now works everywhere, not just /me.
      const renewedSessionRes = await supertest(context.app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(renewedSessionRes.status).toBe(HttpStatus.OK);

      // 7. The old password no longer authenticates at all.
      const oldPasswordLoginRes = await supertest(context.app.getHttpServer())
        .post("/structures/auth/login")
        .send({
          email: STRUCTURE_FIXTURE.email,
          password: STRUCTURE_FIXTURE.password,
        });
      expect(oldPasswordLoginRes.status).toBe(HttpStatus.UNAUTHORIZED);

      // 8. The new password logs in cleanly and is no longer restricted.
      await AppTestHelper.authenticateStructure(
        { ...STRUCTURE_FIXTURE, password: NEW_PASSWORD },
        { context }
      );
      const freshToken = context.authToken;

      const unblockedRes = await supertest(context.app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${freshToken}`);
      expect(unblockedRes.status).toBe(HttpStatus.OK);

      // 9. Overdue again later, the account can't renew back to a password
      // it has already used.
      await userStructureRepository.update(
        { id: STRUCTURE_FIXTURE.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );
      const reuseRes = await supertest(context.app.getHttpServer())
        .post("/users/edit-my-password")
        .set("Authorization", `Bearer ${freshToken}`)
        .send({
          oldPassword: NEW_PASSWORD,
          password: STRUCTURE_FIXTURE.password,
          passwordConfirmation: STRUCTURE_FIXTURE.password,
        });
      expect(reuseRes.status).toBe(HttpStatus.BAD_REQUEST);
      expect(reuseRes.body.message).toBe("NEW_PASSWORD_ALREADY_USED");
    } finally {
      const hash = await passwordGenerator.generatePasswordHash({
        password: STRUCTURE_FIXTURE.password,
      });
      await userStructureRepository.update(
        { id: STRUCTURE_FIXTURE.id },
        { password: hash, passwordLastUpdate: new Date() }
      );
      await userStructureSecurityRepository.update(
        { userId: STRUCTURE_FIXTURE.id },
        { passwordHistory: [] }
      );
    }
  });

  it("supervisor: EXPIRED password blocks the account, renewing it lifts the block and the old password stops working", async () => {
    const NEW_PASSWORD = "E2ERenewalPass1!";
    try {
      await userSupervisorRepository.update(
        { id: SUPERVISOR_FIXTURE.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );

      await AppTestHelper.authenticateSupervisor(SUPERVISOR_FIXTURE, {
        context,
      });
      const staleToken = context.authToken;

      const blockedRes = await supertest(context.app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(blockedRes.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(blockedRes.body.message).toBe("PASSWORD_RENEWAL_REQUIRED");

      const meRes = await supertest(context.app.getHttpServer())
        .get("/portail-admins/auth/me")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(meRes.status).toBe(HttpStatus.OK);

      const renewRes = await supertest(context.app.getHttpServer())
        .post("/users-supervisor/edit-my-password")
        .set("Authorization", `Bearer ${staleToken}`)
        .send({
          oldPassword: SUPERVISOR_FIXTURE.password,
          password: NEW_PASSWORD,
          passwordConfirmation: NEW_PASSWORD,
        });
      expect(renewRes.status).toBe(HttpStatus.OK);

      const renewedSessionRes = await supertest(context.app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(renewedSessionRes.status).toBe(HttpStatus.OK);

      await AppTestHelper.authenticateSupervisor(
        { ...SUPERVISOR_FIXTURE, password: NEW_PASSWORD },
        { context }
      );
      const freshToken = context.authToken;

      const unblockedRes = await supertest(context.app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${freshToken}`);
      expect(unblockedRes.status).toBe(HttpStatus.OK);

      await userSupervisorRepository.update(
        { id: SUPERVISOR_FIXTURE.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );
      const reuseRes = await supertest(context.app.getHttpServer())
        .post("/users-supervisor/edit-my-password")
        .set("Authorization", `Bearer ${freshToken}`)
        .send({
          oldPassword: NEW_PASSWORD,
          password: SUPERVISOR_FIXTURE.password,
          passwordConfirmation: SUPERVISOR_FIXTURE.password,
        });
      expect(reuseRes.status).toBe(HttpStatus.BAD_REQUEST);
      expect(reuseRes.body.message).toBe("NEW_PASSWORD_ALREADY_USED");
    } finally {
      const hash = await passwordGenerator.generatePasswordHash({
        password: SUPERVISOR_FIXTURE.password,
      });
      await userSupervisorRepository.update(
        { id: SUPERVISOR_FIXTURE.id },
        { password: hash, passwordLastUpdate: new Date() }
      );
      await userSupervisorSecurityRepository.update(
        { userId: SUPERVISOR_FIXTURE.id },
        { passwordHistory: [] }
      );
    }
  });

  it("structure: a fresh password never blocks anything (regression guard)", async () => {
    await userStructureRepository.update(
      { id: STRUCTURE_FIXTURE.id },
      { passwordLastUpdate: new Date() }
    );
    await AppTestHelper.authenticateStructure(STRUCTURE_FIXTURE, { context });

    const response = await AppTestHttpClient.get("/users", { context });

    expect(response.status).toBe(HttpStatus.OK);
  });
});
