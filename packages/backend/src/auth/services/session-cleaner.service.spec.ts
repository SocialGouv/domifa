import { userStructureSecurityRepository } from "../../database";
import { CurrentUserSession, HistoricalUserSession } from "../../_common/model";
import { TESTS_USERS_STRUCTURE } from "../../_tests";
import { AppTestHelper } from "../../util/test";
import { SessionCleanerService } from "./session-cleaner.service";

describe("SessionCleanerService", () => {
  const cleaner = new SessionCleanerService();
  const testUser = TESTS_USERS_STRUCTURE.BY_EMAIL["s1-agent@yopmail.com"];

  let snapshot: {
    currentSession: CurrentUserSession | null;
    sessionsHistory: HistoricalUserSession[];
  } | null = null;

  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });

  beforeEach(async () => {
    const row = await userStructureSecurityRepository.findOne({
      where: { userId: testUser.id },
    });
    snapshot = row
      ? {
          currentSession: row.currentSession ?? null,
          sessionsHistory: row.sessionsHistory ?? [],
        }
      : null;
  });

  afterEach(async () => {
    if (snapshot) {
      await userStructureSecurityRepository.update(
        { userId: testUser.id },
        snapshot
      );
    }
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("moves expired active sessions into history with reason EXPIRED", async () => {
    const expired: CurrentUserSession = {
      uuid: "00000000-0000-0000-0000-000000000001",
      salt: "00000000-0000-0000-0000-aaaaaaaaaaaa",
      fingerprintHash: "deadbeef",
      ipAddress: "1.1.1.1",
      userAgent: "ua",
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
      lastVerifiedAt: null,
    };

    await userStructureSecurityRepository.update(
      { userId: testUser.id },
      { currentSession: expired, sessionsHistory: [] }
    );

    await cleaner.cleanupExpiredSessions();

    const row = await userStructureSecurityRepository.findOne({
      where: { userId: testUser.id },
    });
    expect(row?.currentSession).toBeNull();
    const closed = (row?.sessionsHistory ?? []).find(
      (s) => s.uuid === expired.uuid
    );
    expect(closed?.closedReason).toEqual("EXPIRED");
    expect(closed?.closedAt).toBeDefined();
  });

  it("leaves still-valid sessions untouched", async () => {
    const fresh: CurrentUserSession = {
      uuid: "00000000-0000-0000-0000-000000000002",
      salt: "00000000-0000-0000-0000-bbbbbbbbbbbb",
      fingerprintHash: "feedbeef",
      ipAddress: "1.1.1.1",
      userAgent: "ua",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      lastVerifiedAt: null,
    };

    await userStructureSecurityRepository.update(
      { userId: testUser.id },
      { currentSession: fresh, sessionsHistory: [] }
    );

    await cleaner.cleanupExpiredSessions();

    const row = await userStructureSecurityRepository.findOne({
      where: { userId: testUser.id },
    });
    expect(row?.currentSession?.uuid).toEqual(fresh.uuid);
  });

  it("purges historical entries older than the retention window", async () => {
    const veryOld: HistoricalUserSession = {
      uuid: "00000000-0000-0000-0000-000000000003",
      salt: "00000000-0000-0000-0000-cccccccccccc",
      fingerprintHash: "feedbabe",
      ipAddress: "1.1.1.1",
      userAgent: "ua",
      createdAt: new Date(Date.now() - 500 * 86_400_000).toISOString(),
      expiresAt: new Date(Date.now() - 400 * 86_400_000).toISOString(),
      lastVerifiedAt: null,
      closedAt: new Date(Date.now() - 400 * 86_400_000).toISOString(),
      closedReason: "EXPIRED",
    };

    await userStructureSecurityRepository.update(
      { userId: testUser.id },
      { currentSession: null, sessionsHistory: [veryOld] }
    );

    await cleaner.cleanupExpiredSessions();

    const row = await userStructureSecurityRepository.findOne({
      where: { userId: testUser.id },
    });
    expect(
      (row?.sessionsHistory ?? []).find((s) => s.uuid === veryOld.uuid)
    ).toBeUndefined();
  });
});
