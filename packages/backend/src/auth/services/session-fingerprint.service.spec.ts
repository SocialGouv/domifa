import { userStructureSecurityRepository } from "../../database";
import { CurrentUserSession, HistoricalUserSession } from "../../_common/model";
import { TESTS_USERS_STRUCTURE } from "../../_tests";
import { AppTestHelper } from "../../util/test";
import { SessionFingerprintService } from "./session-fingerprint.service";

describe("SessionFingerprintService", () => {
  const service = new SessionFingerprintService();
  const testUser = TESTS_USERS_STRUCTURE.BY_EMAIL["s1-agent@yopmail.com"];

  // Snapshot the user's security row before each test so we can restore the
  // shared test DB to a clean state. Other suites read these rows, so any
  // permanent mutation would create cross-test flakiness.
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

  describe("computeFingerprint", () => {
    it("is deterministic for identical inputs", () => {
      const a = service.computeFingerprint("uuid-1", "1.2.3.4", "ua", "s");
      const b = service.computeFingerprint("uuid-1", "1.2.3.4", "ua", "s");
      expect(a).toEqual(b);
      expect(a).toMatch(/^[a-f0-9]{64}$/);
    });

    it("is sensitive to each input", () => {
      const base = service.computeFingerprint("uuid-1", "1.2.3.4", "ua", "s");
      expect(
        service.computeFingerprint("uuid-2", "1.2.3.4", "ua", "s")
      ).not.toEqual(base);
      expect(
        service.computeFingerprint("uuid-1", "1.2.3.5", "ua", "s")
      ).not.toEqual(base);
      expect(
        service.computeFingerprint("uuid-1", "1.2.3.4", "ub", "s")
      ).not.toEqual(base);
      expect(
        service.computeFingerprint("uuid-1", "1.2.3.4", "ua", "different")
      ).not.toEqual(base);
    });
  });

  describe("startNewSession (structure)", () => {
    it("creates the active session with a fresh salt", async () => {
      const session = await service.startNewSession(
        "structure",
        testUser.id,
        testUser.uuid,
        "10.0.0.1",
        "Mozilla/5.0",
        testUser.structureId
      );
      expect(session.salt).toMatch(/^[0-9a-f-]{36}$/);
      expect(session.fingerprintHash).toEqual(
        service.computeFingerprint(
          testUser.uuid,
          "10.0.0.1",
          "Mozilla/5.0",
          session.salt
        )
      );

      const row = await userStructureSecurityRepository.findOne({
        where: { userId: testUser.id },
      });
      expect(row?.currentSession?.uuid).toEqual(session.uuid);
      expect(row?.currentSession?.salt).toEqual(session.salt);
    });

    it("rotates the active session on a second call and pushes the previous one to history with REPLACED", async () => {
      const first = await service.startNewSession(
        "structure",
        testUser.id,
        testUser.uuid,
        "10.0.0.1",
        "Mozilla/5.0",
        testUser.structureId
      );
      const second = await service.startNewSession(
        "structure",
        testUser.id,
        testUser.uuid,
        "10.0.0.2",
        "Other-UA",
        testUser.structureId
      );
      expect(second.uuid).not.toEqual(first.uuid);
      expect(second.salt).not.toEqual(first.salt);
      expect(second.fingerprintHash).not.toEqual(first.fingerprintHash);
      expect(second.fingerprintHash).toEqual(
        service.computeFingerprint(
          testUser.uuid,
          "10.0.0.2",
          "Other-UA",
          second.salt
        )
      );

      const row = await userStructureSecurityRepository.findOne({
        where: { userId: testUser.id },
      });
      expect(row?.currentSession?.uuid).toEqual(second.uuid);
      const replaced = (row?.sessionsHistory ?? []).find(
        (s) => s.uuid === first.uuid
      );
      expect(replaced?.closedReason).toEqual("REPLACED");
      expect(replaced?.closedAt).toBeDefined();
    });
  });

  describe("verifySessionFromJwt", () => {
    it("returns true and bumps lastVerifiedAt when the hash matches", async () => {
      const session = await service.startNewSession(
        "structure",
        testUser.id,
        testUser.uuid,
        "10.0.0.1",
        "Mozilla/5.0",
        testUser.structureId
      );

      await expect(
        service.verifySessionFromJwt(
          "structure",
          testUser.id,
          testUser.uuid,
          session.fingerprintHash,
          "10.0.0.1",
          "Mozilla/5.0"
        )
      ).resolves.toBe(true);

      const reloaded = await userStructureSecurityRepository.findOne({
        where: { userId: testUser.id },
      });
      expect(reloaded?.currentSession?.lastVerifiedAt).not.toBeNull();
    });

    it("returns true regardless of current IP/UA — fingerprint is treated as an opaque token", async () => {
      const session = await service.startNewSession(
        "structure",
        testUser.id,
        testUser.uuid,
        "10.0.0.1",
        "Mozilla/5.0",
        testUser.structureId
      );

      await expect(
        service.verifySessionFromJwt(
          "structure",
          testUser.id,
          testUser.uuid,
          session.fingerprintHash,
          "10.0.0.99", // different IP
          "Other-UA" // different UA
        )
      ).resolves.toBe(true);
    });

    it("returns false when the JWT carries a fingerprint that no longer matches the active session (rotated)", async () => {
      await service.startNewSession(
        "structure",
        testUser.id,
        testUser.uuid,
        "10.0.0.1",
        "Mozilla/5.0",
        testUser.structureId
      );
      // Simulate a stale JWT issued by a previous (now-replaced) session.
      const staleHash = service.computeFingerprint(
        testUser.uuid,
        "10.0.0.1",
        "Mozilla/5.0",
        "stale-salt"
      );

      await expect(
        service.verifySessionFromJwt(
          "structure",
          testUser.id,
          testUser.uuid,
          staleHash,
          "10.0.0.1",
          "Mozilla/5.0"
        )
      ).resolves.toBe(false);
    });

    it("returns false when no active session exists", async () => {
      await userStructureSecurityRepository.update(
        { userId: testUser.id },
        { currentSession: null }
      );

      await expect(
        service.verifySessionFromJwt(
          "structure",
          testUser.id,
          testUser.uuid,
          "any-hash",
          "10.0.0.1",
          "Mozilla/5.0"
        )
      ).resolves.toBe(false);
    });
  });

  describe("closeActiveSession", () => {
    it("moves the active session into history with the given reason", async () => {
      const session = await service.startNewSession(
        "structure",
        testUser.id,
        testUser.uuid,
        "10.0.0.1",
        "Mozilla/5.0",
        testUser.structureId
      );

      await service.closeActiveSession(
        "structure",
        testUser.id,
        "MANUAL_LOGOUT"
      );

      const row = await userStructureSecurityRepository.findOne({
        where: { userId: testUser.id },
      });
      expect(row?.currentSession).toBeNull();
      const history = row?.sessionsHistory ?? [];
      const closed = history.find((s) => s.uuid === session.uuid);
      expect(closed?.closedReason).toEqual("MANUAL_LOGOUT");
      expect(closed?.closedAt).toBeDefined();
    });
  });
});
