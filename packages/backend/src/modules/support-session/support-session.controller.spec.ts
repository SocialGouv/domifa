import { forwardRef } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { PortailAdminModule } from "../portail-admin";
import { SmsModule } from "../sms/sms.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { InteractionDto } from "../interactions/dto";
import {
  structureRepository,
  supportSessionRepository,
  userStructureRepository,
  userSupervisorRepository,
  userSupervisorSecurityRepository,
} from "../../database";
import { UserSupervisorTable } from "../../database/entities/user-supervisor";
import { passwordGenerator } from "../../util";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../util/test";
import { TESTS_USERS_ADMIN } from "../../_tests";
import { SupportSession } from "@domifa/common";

// This supervisor is created directly in the test DB (not the shared
// TESTS_USERS_ADMIN dump fixture) specifically to exercise the domain-based
// rejection: same role/permissions as a real super-admin-domifa account, but
// an email outside @fabrique.social.gouv.fr, which SupportSessionService
// rejects independently of the RBAC role check. Scoped to this file only —
// created in beforeAll, deleted in afterAll — so it never becomes a second
// shared fixture other suites might accidentally depend on.
const OUTSIDER_ADMIN_EMAIL = "support-mode-outsider-admin@yopmail.com";
const OUTSIDER_ADMIN_PASSWORD = "Azerty012345!";

describe("Support mode (SupportSessionController + support-mode write guard)", () => {
  let context: AppTestContext;
  let outsiderContext: AppTestContext;
  let outsiderAdminId: number;

  // structureId=3 ("Organisme agréé de Test"): has an ACTIVE admin account,
  // distinct from the supervisor doing the impersonating.
  let targetStructureUuid: string;
  // structureId=2 ("CIAS de Test"): exists but has zero ACTIVE user_structure
  // accounts — used for the "no eligible account to impersonate" case.
  let emptyStructureUuid: string;

  let supportAccessToken: string;
  let supportSessionUuid: string;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [],
        imports: [
          PortailAdminModule,
          InteractionsModule,
          forwardRef(() => UsersModule),
          forwardRef(() => UsagersModule),
          forwardRef(() => StructuresModule),
          forwardRef(() => SmsModule),
          forwardRef(() => AuthModule),
        ],
        providers: [],
      },
      { initApp: true }
    );
    outsiderContext = { module: context.module, app: context.app };

    const [targetStructure, emptyStructure] = await Promise.all([
      structureRepository.findOneByOrFail({ id: 3 }),
      structureRepository.findOneByOrFail({ id: 2 }),
    ]);
    targetStructureUuid = targetStructure.uuid;
    emptyStructureUuid = emptyStructure.uuid;

    const outsiderAdmin = new UserSupervisorTable({
      prenom: "Outsider",
      nom: "SupportModeTest",
      email: OUTSIDER_ADMIN_EMAIL,
      role: "super-admin-domifa",
      territories: [],
    });
    outsiderAdmin.status = "ACTIVE";
    outsiderAdmin.acceptTerms = new Date();
    outsiderAdmin.password = await passwordGenerator.generatePasswordHash({
      password: OUTSIDER_ADMIN_PASSWORD,
    });
    const savedOutsider = await userSupervisorRepository.save(outsiderAdmin);
    outsiderAdminId = savedOutsider.id;
    await userSupervisorSecurityRepository.save({ userId: savedOutsider.id });

    const authInfo =
      TESTS_USERS_ADMIN.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    await AppTestHelper.authenticateSupervisor(authInfo, { context });

    await AppTestHelper.authenticateSupervisor(
      {
        uuid: savedOutsider.uuid,
        id: savedOutsider.id,
        email: OUTSIDER_ADMIN_EMAIL,
        password: OUTSIDER_ADMIN_PASSWORD,
      },
      { context: outsiderContext }
    );
  });

  afterAll(async () => {
    // Defensive cleanup: revoke any support session this suite left ACTIVE
    // (a failed assertion earlier in the file must not leak state into the
    // shared test DB for other suites).
    try {
      await supportSessionRepository.update(
        {
          supervisorId:
            TESTS_USERS_ADMIN.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"]
              .id,
          status: "ACTIVE",
        },
        {
          status: "REVOKED",
          revokedReason: "MANUAL_REVOKE",
          revokedBy: "test-cleanup",
        }
      );
      await userStructureRepository.update(
        { structureId: 3 },
        { isSupportMode: false }
      );
      await userSupervisorRepository.update(
        {
          id: TESTS_USERS_ADMIN.BY_EMAIL[
            "preprod.domifa@fabrique.social.gouv.fr"
          ].id,
        },
        { support: null }
      );
    } catch {
      // best-effort
    }

    await userSupervisorSecurityRepository.delete({ userId: outsiderAdminId });
    await userSupervisorRepository.delete({ id: outsiderAdminId });

    await AppTestHelper.tearDownTestApp(context);
  });

  it("rejects activation from a supervisor outside @fabrique.social.gouv.fr", async () => {
    const response = await AppTestHttpClient.post(
      `/admin/structures/structure/${targetStructureUuid}/support-session`,
      { context: outsiderContext }
    );

    expect(response.status).toEqual(403);
    expect(response.body.message).toEqual("SUPPORT_MODE_NOT_ALLOWED");
  });

  it("rejects activation on a structure with no active account to impersonate", async () => {
    const response = await AppTestHttpClient.post(
      `/admin/structures/structure/${emptyStructureUuid}/support-session`,
      { context }
    );

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual("NO_ACTIVE_STRUCTURE_ACCOUNT");
  });

  it("rejects activation on a structure that does not exist", async () => {
    const response = await AppTestHttpClient.post(
      "/admin/structures/structure/00000000-0000-4000-8000-000000000000/support-session",
      { context }
    );

    expect(response.status).toEqual(400);
  });

  it("activates a support session for a valid @fabrique.social.gouv.fr super-admin", async () => {
    const response = await AppTestHttpClient.post(
      `/admin/structures/structure/${targetStructureUuid}/support-session`,
      { context }
    );

    expect(response.status).toEqual(201);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.structureId).toEqual(3);

    supportAccessToken = response.body.accessToken;

    const sessions = await AppTestHttpClient.get(
      `/admin/structures/structure/${targetStructureUuid}/support-sessions`,
      { context }
    );
    const active = (sessions.body as SupportSession[]).find(
      (s) => s.status === "ACTIVE"
    );
    expect(active).toBeDefined();
    supportSessionUuid = active!.uuid!;
  });

  it("lets the impersonated support session read data", async () => {
    const supportContext: AppTestContext = {
      module: context.module,
      app: context.app,
      authToken: supportAccessToken,
    };

    const response = await AppTestHttpClient.get("/structures/auth/me", {
      context: supportContext,
    });

    expect(response.status).toEqual(200);
    expect(response.body.supportMode).toEqual(true);
    expect(response.body.supervisorEmail).toEqual(
      "preprod.domifa@fabrique.social.gouv.fr"
    );
    expect(response.body.structureId).toEqual(3);
  });

  it("blocks a write action (ajout de courrier) during a support session", async () => {
    const supportContext: AppTestContext = {
      module: context.module,
      app: context.app,
      authToken: supportAccessToken,
    };

    const response = await AppTestHttpClient.post("/interactions/1", {
      context: supportContext,
      body: [{ type: "courrierIn", nbCourrier: 1 } as InteractionDto],
    });

    expect(response.status).toEqual(403);
    expect(response.body.message).toEqual("SUPPORT_MODE_READ_ONLY");
  });

  it("lets the admin revoke the support session, clearing DB state", async () => {
    const response = await AppTestHttpClient.delete(
      `/admin/structures/structure/${targetStructureUuid}/support-session/${supportSessionUuid}`,
      { context }
    );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ status: "REVOKED" });

    const session = await supportSessionRepository.findOneByOrFail({
      uuid: supportSessionUuid,
    });
    expect(session.status).toEqual("REVOKED");

    const impersonatedAccount = await userStructureRepository.findOneByOrFail({
      structureId: 3,
      role: "admin",
    });
    expect(impersonatedAccount.isSupportMode).toEqual(false);

    const supervisor = await userSupervisorRepository.findOneByOrFail({
      email: "preprod.domifa@fabrique.social.gouv.fr",
    });
    expect(supervisor.support).toBeNull();
  });
});
