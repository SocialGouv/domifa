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
  userStructureSecurityRepository,
  userSupervisorRepository,
  userSupervisorSecurityRepository,
} from "../../database";
import { UserSupervisorTable } from "../../database/entities/user-supervisor";
import { UserStructureTable } from "../../database/entities/user-structure";
import { passwordGenerator } from "../../util";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../util/test";
import { SupportSession } from "@domifa/common";

// Both accounts below are created directly in the test DB rather than
// pulled from the shared TESTS_USERS_ADMIN/TESTS_USERS_STRUCTURE dump
// fixtures — created in beforeAll, deleted in afterAll — so this suite
// never becomes a shared fixture other suites might accidentally depend on.
//
// There is no dedicated "support" account anymore: the activating admin's
// own structure account (same email as their supervisor account, own
// unrelated password) is what gets temporarily toggled to role "support".
const ACTIVATING_ADMIN_EMAIL =
  "support-mode-test-activator@fabrique.social.gouv.fr";
const ACTIVATING_SUPERVISOR_PASSWORD = "Azerty012345!";
const ACTIVATING_STRUCTURE_PASSWORD = "Bravo987654!";
const OUTSIDER_ADMIN_EMAIL = "support-mode-outsider-admin@yopmail.com";
const OUTSIDER_ADMIN_PASSWORD = "Azerty012345!";

describe("Support mode — an admin's own structure account attached to a structure", () => {
  let context: AppTestContext;
  let outsiderContext: AppTestContext;
  let supportContext: AppTestContext;

  let activatingSupervisorId: number;
  let activatingAdminAccountId: number;
  let activatingAdminAccountUuid: string;
  let outsiderAdminId: number;

  // structureId=3 ("Organisme agréé de Test"): the structure the account
  // gets attached to throughout this suite.
  let targetStructureId: number;
  let targetStructureUuid: string;

  let attachmentUuid: string;

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
    supportContext = { module: context.module, app: context.app };

    const targetStructure = await structureRepository.findOneByOrFail({
      id: 3,
    });
    targetStructureId = targetStructure.id;
    targetStructureUuid = targetStructure.uuid;

    // The activating admin: a supervisor account for the portail-admins
    // login, and their own real structure account (role "admin" — their
    // day-to-day role) on the same email. Only the latter gets toggled.
    const activatingSupervisor = new UserSupervisorTable({
      prenom: "Activator",
      nom: "SupportModeTest",
      email: ACTIVATING_ADMIN_EMAIL,
      role: "super-admin-domifa",
      territories: [],
    });
    activatingSupervisor.status = "ACTIVE";
    activatingSupervisor.acceptTerms = new Date();
    activatingSupervisor.password =
      await passwordGenerator.generatePasswordHash({
        password: ACTIVATING_SUPERVISOR_PASSWORD,
      });
    const savedSupervisor = await userSupervisorRepository.save(
      activatingSupervisor
    );
    activatingSupervisorId = savedSupervisor.id;
    await userSupervisorSecurityRepository.save({ userId: savedSupervisor.id });

    const structurePasswordHash = await passwordGenerator.generatePasswordHash({
      password: ACTIVATING_STRUCTURE_PASSWORD,
    });
    // Deliberately distinct from targetStructureId: proves /me's structureId
    // comes from the active attachment while support mode is on, and reverts
    // to this real home structure once it's off — not a coincidence of both
    // being the same id.
    const homeStructure = await structureRepository.findOneByOrFail({
      id: 1,
    });
    const savedAccount = await userStructureRepository.save(
      new UserStructureTable({
        email: ACTIVATING_ADMIN_EMAIL,
        nom: "Activator",
        prenom: "SupportModeTest",
        role: "admin",
        status: "ACTIVE",
        password: structurePasswordHash,
        structureId: homeStructure.id,
      })
    );
    activatingAdminAccountId = savedAccount.id;
    activatingAdminAccountUuid = savedAccount.uuid;
    await userStructureSecurityRepository.save({ userId: savedAccount.id });

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

    await AppTestHelper.authenticateSupervisor(
      {
        uuid: savedSupervisor.uuid,
        id: savedSupervisor.id,
        email: ACTIVATING_ADMIN_EMAIL,
        password: ACTIVATING_SUPERVISOR_PASSWORD,
      },
      { context }
    );

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
    // Defensive cleanup: a failed assertion earlier in the file must not
    // leak an ACTIVE attachment into the shared test DB for other suites.
    try {
      await supportSessionRepository.update(
        { targetUserStructureId: activatingAdminAccountId, status: "ACTIVE" },
        {
          status: "REVOKED",
          revokedReason: "MANUAL_REVOKE",
          revokedBy: "test-cleanup",
        }
      );
    } catch {
      // best-effort
    }

    await userStructureSecurityRepository.delete({
      userId: activatingAdminAccountId,
    });
    await userStructureRepository.delete({ id: activatingAdminAccountId });
    await userSupervisorSecurityRepository.delete({
      userId: activatingSupervisorId,
    });
    await userSupervisorRepository.delete({ id: activatingSupervisorId });
    await userSupervisorSecurityRepository.delete({ userId: outsiderAdminId });
    await userSupervisorRepository.delete({ id: outsiderAdminId });

    await AppTestHelper.tearDownTestApp(context);
  });

  it("rejects attachment from a supervisor outside @fabrique.social.gouv.fr", async () => {
    const response = await AppTestHttpClient.post(
      `/admin/structures/structure/${targetStructureUuid}/support-session`,
      { context: outsiderContext }
    );

    expect(response.status).toEqual(403);
    expect(response.body.message).toEqual("SUPPORT_MODE_NOT_ALLOWED");
  });

  it("rejects attachment on a structure that does not exist", async () => {
    const response = await AppTestHttpClient.post(
      "/admin/structures/structure/00000000-0000-4000-8000-000000000000/support-session",
      { context }
    );

    expect(response.status).toEqual(400);
  });

  it("attaches the admin's own structure account to a structure", async () => {
    const response = await AppTestHttpClient.post(
      `/admin/structures/structure/${targetStructureUuid}/support-session`,
      { context }
    );

    expect(response.status).toEqual(201);
    expect(response.body.structureId).toEqual(targetStructureId);
    // No token here: the account authenticates separately, through the
    // normal login flow — see ActivateSupportSessionResponse.
    expect(response.body.accessToken).toBeUndefined();

    const sessions = await AppTestHttpClient.get(
      `/admin/structures/structure/${targetStructureUuid}/support-sessions`,
      { context }
    );
    const active = (sessions.body as SupportSession[]).find(
      (s) => s.status === "ACTIVE"
    );
    expect(active).toBeDefined();
    expect(active!.targetUserStructureId).toEqual(activatingAdminAccountId);
    // The account's role before activation was "admin" — proves the real
    // role got snapshotted, not overwritten with "support" itself.
    expect(active!.originalRole).toEqual("admin");
    attachmentUuid = active!.uuid!;

    const account = await userStructureRepository.findOneByOrFail({
      id: activatingAdminAccountId,
    });
    expect(account.role).toEqual("support");
  });

  it("re-attaching evicts the prior attachment (REPLACED) without corrupting the saved role", async () => {
    const previousUuid = attachmentUuid;

    const response = await AppTestHttpClient.post(
      `/admin/structures/structure/${targetStructureUuid}/support-session`,
      { context }
    );
    expect(response.status).toEqual(201);

    const previous = await supportSessionRepository.findOneByOrFail({
      uuid: previousUuid,
    });
    expect(previous.status).toEqual("REVOKED");
    expect(previous.revokedReason).toEqual("REPLACED");

    const sessions = await AppTestHttpClient.get(
      `/admin/structures/structure/${targetStructureUuid}/support-sessions`,
      { context }
    );
    const active = (sessions.body as SupportSession[]).find(
      (s) => s.status === "ACTIVE"
    );
    expect(active).toBeDefined();
    expect(active!.uuid).not.toEqual(previousUuid);
    // The account was already role "support" when this second activation
    // ran (first attachment never closed) — the saved original role must
    // still read "admin", carried forward from the first attachment, not
    // re-derived from the now-"support" live column.
    expect(active!.originalRole).toEqual("admin");
    attachmentUuid = active!.uuid!;
  });

  it("logs the account in through the normal login flow and resolves the structure from the attachment", async () => {
    await AppTestHelper.authenticateStructure(
      {
        uuid: activatingAdminAccountUuid,
        id: activatingAdminAccountId,
        structureId: targetStructureId,
        email: ACTIVATING_ADMIN_EMAIL,
        password: ACTIVATING_STRUCTURE_PASSWORD,
        role: "support",
      },
      { context: supportContext }
    );

    const response = await AppTestHttpClient.get("/structures/auth/me", {
      context: supportContext,
    });

    expect(response.status).toEqual(200);
    expect(response.body.role).toEqual("support");
    // Proves structureId comes from the active attachment, not from the
    // account's own (unrelated) structureId column.
    expect(response.body.structureId).toEqual(targetStructureId);
    expect(response.body.supportAttachmentExpiresAt).toBeDefined();
  });

  it("lets the support account read data", async () => {
    const response = await AppTestHttpClient.get(
      "/search-usagers?chargerTousRadies=false",
      { context: supportContext }
    );

    expect(response.status).toEqual(200);
  });

  it("blocks a write action (ajout de courrier)", async () => {
    const response = await AppTestHttpClient.post("/interactions/1", {
      context: supportContext,
      body: [{ type: "courrierIn", nbCourrier: 1 } as InteractionDto],
    });

    expect(response.status).toEqual(403);
  });

  it("blocks a GET-that-writes route", async () => {
    const response = await AppTestHttpClient.get(
      "/usagers-decision/renouvellement/1",
      { context: supportContext }
    );

    expect(response.status).toEqual(403);
  });

  it("lets the admin detach the account, restoring its role, then the old token resolves to their real account again", async () => {
    const response = await AppTestHttpClient.delete(
      `/admin/structures/structure/${targetStructureUuid}/support-session/${attachmentUuid}`,
      { context }
    );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ status: "REVOKED" });

    const session = await supportSessionRepository.findOneByOrFail({
      uuid: attachmentUuid,
    });
    expect(session.status).toEqual("REVOKED");

    const account = await userStructureRepository.findOneByOrFail({
      id: activatingAdminAccountId,
    });
    expect(account.role).toEqual("admin");

    // Unlike the old dedicated-account design (role permanently "support",
    // so a revoked attachment made findAuthUser refuse the token outright),
    // this account's role genuinely reverts — findAuthUser reads role fresh
    // from the row on every request and never trusts the JWT for it, so the
    // very same still-unexpired token now simply resolves to the admin's
    // real identity again: their own role, their own home structure, no
    // trace of the target structure's data. The support session itself
    // (attachmentUuid) is gone either way — a fresh activation is required
    // to regain access to that structure.
    const replay = await AppTestHttpClient.get("/structures/auth/me", {
      context: supportContext,
    });
    expect(replay.status).toEqual(200);
    expect(replay.body.role).toEqual("admin");
    expect(replay.body.structureId).toEqual(account.structureId);
    expect(replay.body.structureId).not.toEqual(targetStructureId);
  });
});
