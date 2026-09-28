import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { SECURITY_TESTS_NEST_MODULE } from "../../../_tests/SECURITY_TESTS_NEST_MODULE.const";
import { TestUserAdmin, TestUserStructure } from "../../../_tests";
import {
  userStructureRepository,
  userStructureSecurityRepository,
  userSupervisorRepository,
  userSupervisorSecurityRepository,
  UserStructureTable,
  UserSupervisorTable,
} from "../../../database";
import { passwordGenerator } from "../../../util";

// End-to-end walk-through of the whole password-renewal-after-inactivity
// feature, exercised over real HTTP calls (supertest) rather than unit-level
// service/guard assertions — each step is what a real client would actually
// do: log in with a stale password, get blocked on several kinds of
// endpoints (read, write, other controllers), renew, and come back in.
//
// This file creates its own dedicated structure/supervisor accounts instead
// of reusing the shared TESTS_USERS_* fixtures: those are relied on by many
// other spec files against the same seeded test database, and mutating
// their password/passwordLastUpdate here would risk colliding with them.
describe("Password renewal — end to end", () => {
  let context: AppTestContext;

  const DEDICATED_PASSWORD = "E2EDedicatedPass1!";
  // Existing seed structure (already carries other test users) — only used
  // here as the required FK for a brand new user row, never mutated itself.
  const EXISTING_STRUCTURE_ID = 3;

  let structureFixture: TestUserStructure;
  let supervisorFixture: TestUserAdmin;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(SECURITY_TESTS_NEST_MODULE, {
      initApp: true,
    });

    const passwordHash = await passwordGenerator.generatePasswordHash({
      password: DEDICATED_PASSWORD,
    });

    const structureUser = await userStructureRepository.save(
      new UserStructureTable({
        email: `password-renewal-e2e-structure-${Date.now()}@yopmail.com`,
        nom: "E2E",
        prenom: "PasswordRenewal",
        password: passwordHash,
        role: "admin",
        structureId: EXISTING_STRUCTURE_ID,
        status: "ACTIVE",
        passwordLastUpdate: new Date(),
      })
    );
    // Matches the production pattern in user-structure-creator.service.ts:
    // a plain object, not `new UserStructureSecurityTable(...)` — the entity
    // class' relation decorators on `userId` interfere with a direct insert.
    await userStructureSecurityRepository.save({
      userId: structureUser.id,
      structureId: EXISTING_STRUCTURE_ID,
      passwordHistory: [],
    });
    structureFixture = {
      uuid: structureUser.uuid,
      id: structureUser.id,
      structureId: EXISTING_STRUCTURE_ID,
      email: structureUser.email,
      role: "admin",
      password: DEDICATED_PASSWORD,
    };

    const supervisorUser = await userSupervisorRepository.save(
      new UserSupervisorTable({
        email: `password-renewal-e2e-supervisor-${Date.now()}@yopmail.com`,
        nom: "E2E",
        prenom: "PasswordRenewal",
        password: passwordHash,
        role: "super-admin-domifa",
        status: "ACTIVE",
        territories: [],
        passwordLastUpdate: new Date(),
      })
    );
    await userSupervisorSecurityRepository.save({
      userId: supervisorUser.id,
      passwordHistory: [],
    });
    supervisorFixture = {
      uuid: supervisorUser.uuid,
      id: supervisorUser.id,
      email: supervisorUser.email,
      password: DEDICATED_PASSWORD,
    };
  });

  afterAll(async () => {
    // Cascades: deleting the user row also removes its *_security row.
    if (structureFixture) {
      await userStructureRepository.delete({ id: structureFixture.id });
    }
    if (supervisorFixture) {
      await userSupervisorRepository.delete({ id: supervisorFixture.id });
    }
    await AppTestHelper.tearDownTestApp(context);
  });

  it("structure: EXPIRED password blocks the account on several distinct endpoints, renewing it lifts the block and the old password stops working", async () => {
    const NEW_PASSWORD = "E2ERenewalPass1!";

    try {
      // 1. The account is more than 36 months overdue.
      await userStructureRepository.update(
        { id: structureFixture.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );

      // 2. Login still succeeds — a stale password doesn't lock the account
      // out, it restricts what the (still valid) session can do.
      const loginRes = await supertest(context.app.getHttpServer())
        .post("/structures/auth/login")
        .send({
          email: structureFixture.email,
          password: structureFixture.password,
        });
      expect(loginRes.status).toBe(HttpStatus.OK);
      const staleToken = loginRes.body.access_token as string;
      expect(staleToken).toBeTruthy();

      // 3. A read action is blocked with that token.
      const blockedListRes = await supertest(context.app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(blockedListRes.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(blockedListRes.body.message).toBe("PASSWORD_RENEWAL_REQUIRED");

      // 4. A write action on a different route of the same controller is
      // blocked too — the guard isn't scoped to GETs.
      const blockedPatchRes = await supertest(context.app.getHttpServer())
        .patch("/users")
        .set("Authorization", `Bearer ${staleToken}`)
        .send({ prenom: "Test", nom: "Test", fonction: "AGENT_ACCUEIL" });
      expect(blockedPatchRes.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(blockedPatchRes.body.message).toBe("PASSWORD_RENEWAL_REQUIRED");

      // 5. A completely different controller is blocked as well — the guard
      // is global, not wired endpoint by endpoint.
      const blockedOtherControllerRes = await supertest(
        context.app.getHttpServer()
      )
        .get("/structures/ma-structure")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(blockedOtherControllerRes.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(blockedOtherControllerRes.body.message).toBe(
        "PASSWORD_RENEWAL_REQUIRED"
      );

      // 6. /me stays reachable — the frontend needs it on every navigation,
      // including the one to the renewal page itself.
      const meRes = await supertest(context.app.getHttpServer())
        .get("/structures/auth/me")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(meRes.status).toBe(HttpStatus.OK);

      // 7. Renewing the password with that same (still valid) session works.
      const renewRes = await supertest(context.app.getHttpServer())
        .post("/users/edit-my-password")
        .set("Authorization", `Bearer ${staleToken}`)
        .send({
          oldPassword: structureFixture.password,
          password: NEW_PASSWORD,
          passwordConfirmation: NEW_PASSWORD,
        });
      expect(renewRes.status).toBe(HttpStatus.OK);

      // 8. The session is never killed by the renewal — the guard re-checks
      // passwordLastUpdate live on every request, so the very same token
      // that was blocked a moment ago now works again, on the endpoint that
      // was blocked first.
      const renewedSessionRes = await supertest(context.app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(renewedSessionRes.status).toBe(HttpStatus.OK);

      // 9. The old password no longer authenticates at all.
      const oldPasswordLoginRes = await supertest(context.app.getHttpServer())
        .post("/structures/auth/login")
        .send({
          email: structureFixture.email,
          password: structureFixture.password,
        });
      expect(oldPasswordLoginRes.status).toBe(HttpStatus.UNAUTHORIZED);

      // 10. The new password logs in cleanly and is no longer restricted.
      await AppTestHelper.authenticateStructure(
        { ...structureFixture, password: NEW_PASSWORD },
        { context }
      );
      const freshToken = context.authToken;

      const unblockedRes = await supertest(context.app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${freshToken}`);
      expect(unblockedRes.status).toBe(HttpStatus.OK);

      // 11. Overdue again later, the account can't renew back to a password
      // it has already used.
      await userStructureRepository.update(
        { id: structureFixture.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );
      const reuseRes = await supertest(context.app.getHttpServer())
        .post("/users/edit-my-password")
        .set("Authorization", `Bearer ${freshToken}`)
        .send({
          oldPassword: NEW_PASSWORD,
          password: structureFixture.password,
          passwordConfirmation: structureFixture.password,
        });
      expect(reuseRes.status).toBe(HttpStatus.BAD_REQUEST);
      expect(reuseRes.body.message).toBe("NEW_PASSWORD_ALREADY_USED");
    } finally {
      // The account is dedicated to this file, but restore its password and
      // history anyway so it always starts each test from a known state,
      // whatever order the tests run in.
      const hash = await passwordGenerator.generatePasswordHash({
        password: structureFixture.password,
      });
      await userStructureRepository.update(
        { id: structureFixture.id },
        { password: hash, passwordLastUpdate: new Date() }
      );
      await userStructureSecurityRepository.update(
        { userId: structureFixture.id },
        { passwordHistory: [] }
      );
    }
  });

  it("supervisor: EXPIRED password blocks the account on several distinct endpoints, renewing it lifts the block and the old password stops working", async () => {
    const NEW_PASSWORD = "E2ERenewalPass1!";

    try {
      await userSupervisorRepository.update(
        { id: supervisorFixture.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );

      await AppTestHelper.authenticateSupervisor(supervisorFixture, {
        context,
      });
      const staleToken = context.authToken;

      const blockedListRes = await supertest(context.app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(blockedListRes.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(blockedListRes.body.message).toBe("PASSWORD_RENEWAL_REQUIRED");

      // A different controller is blocked as well.
      const blockedOtherControllerRes = await supertest(
        context.app.getHttpServer()
      )
        .get("/admin/structures")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(blockedOtherControllerRes.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(blockedOtherControllerRes.body.message).toBe(
        "PASSWORD_RENEWAL_REQUIRED"
      );

      const meRes = await supertest(context.app.getHttpServer())
        .get("/portail-admins/auth/me")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(meRes.status).toBe(HttpStatus.OK);

      const renewRes = await supertest(context.app.getHttpServer())
        .post("/users-supervisor/edit-my-password")
        .set("Authorization", `Bearer ${staleToken}`)
        .send({
          oldPassword: supervisorFixture.password,
          password: NEW_PASSWORD,
          passwordConfirmation: NEW_PASSWORD,
        });
      expect(renewRes.status).toBe(HttpStatus.OK);

      const renewedSessionRes = await supertest(context.app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${staleToken}`);
      expect(renewedSessionRes.status).toBe(HttpStatus.OK);

      await AppTestHelper.authenticateSupervisor(
        { ...supervisorFixture, password: NEW_PASSWORD },
        { context }
      );
      const freshToken = context.authToken;

      const unblockedRes = await supertest(context.app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${freshToken}`);
      expect(unblockedRes.status).toBe(HttpStatus.OK);

      await userSupervisorRepository.update(
        { id: supervisorFixture.id },
        { passwordLastUpdate: new Date("2000-01-01") }
      );
      const reuseRes = await supertest(context.app.getHttpServer())
        .post("/users-supervisor/edit-my-password")
        .set("Authorization", `Bearer ${freshToken}`)
        .send({
          oldPassword: NEW_PASSWORD,
          password: supervisorFixture.password,
          passwordConfirmation: supervisorFixture.password,
        });
      expect(reuseRes.status).toBe(HttpStatus.BAD_REQUEST);
      expect(reuseRes.body.message).toBe("NEW_PASSWORD_ALREADY_USED");
    } finally {
      const hash = await passwordGenerator.generatePasswordHash({
        password: supervisorFixture.password,
      });
      await userSupervisorRepository.update(
        { id: supervisorFixture.id },
        { password: hash, passwordLastUpdate: new Date() }
      );
      await userSupervisorSecurityRepository.update(
        { userId: supervisorFixture.id },
        { passwordHistory: [] }
      );
    }
  });

  it("structure: a fresh password never blocks anything (regression guard)", async () => {
    await userStructureRepository.update(
      { id: structureFixture.id },
      { passwordLastUpdate: new Date() }
    );
    await AppTestHelper.authenticateStructure(structureFixture, { context });

    const response = await AppTestHttpClient.get("/users", { context });

    expect(response.status).toBe(HttpStatus.OK);
  });
});
