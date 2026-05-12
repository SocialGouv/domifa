import { AppTestHelper } from "../../../../util/test";
import { otpRepository } from "../otpRepository.service";

const TEST_DOMAIN = "test-otp-repo.local";
const email = (slug: string) => `${slug}@${TEST_DOMAIN}`;

async function cleanup(): Promise<void> {
  await otpRepository
    .createQueryBuilder()
    .delete()
    .where("email LIKE :pattern", { pattern: `%@${TEST_DOMAIN}` })
    .execute();
}

describe("otpRepository (DB)", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
    await cleanup();
  });
  afterAll(async () => {
    await cleanup();
    await AppTestHelper.tearDownTestConnection();
  });
  beforeEach(cleanup);

  describe("countRecentByEmail", () => {
    it("counts only rows within the window", async () => {
      const e = email("count");
      const now = Date.now();
      await otpRepository.save({
        email: e,
        code: "h-recent",
        expiresAt: new Date(now + 60_000),
        purpose: null,
      });
      const old = await otpRepository.save({
        email: e,
        code: "h-old",
        expiresAt: new Date(now + 60_000),
        purpose: null,
      });
      await otpRepository
        .createQueryBuilder()
        .update()
        .set({ createdAt: new Date(now - 30 * 60 * 1000) })
        .where("uuid = :uuid", { uuid: old.uuid })
        .execute();

      expect(await otpRepository.countRecentByEmail(e, 15)).toBe(1);
    });

    it("returns 0 when no OTP exists for the email", async () => {
      expect(await otpRepository.countRecentByEmail(email("none"), 15)).toBe(0);
    });
  });

  describe("claimValidOtp", () => {
    it("marks used and returns the row on a valid claim", async () => {
      const e = email("claim-valid");
      await otpRepository.save({
        email: e,
        code: "hashed-OK",
        expiresAt: new Date(Date.now() + 60_000),
        purpose: null,
      });

      const claimed = await otpRepository.claimValidOtp(e, "hashed-OK", 5);
      expect(claimed).not.toBeNull();
      expect(claimed!.used).toBe(true);

      expect(await otpRepository.claimValidOtp(e, "hashed-OK", 5)).toBeNull();
    });

    it("returns null when the code does not match", async () => {
      const e = email("claim-wrong");
      await otpRepository.save({
        email: e,
        code: "hashed-OK",
        expiresAt: new Date(Date.now() + 60_000),
        purpose: null,
      });
      expect(
        await otpRepository.claimValidOtp(e, "hashed-WRONG", 5)
      ).toBeNull();
    });

    it("returns null when the OTP is expired", async () => {
      const e = email("claim-expired");
      await otpRepository.save({
        email: e,
        code: "hashed",
        expiresAt: new Date(Date.now() - 1000),
        purpose: null,
      });
      expect(await otpRepository.claimValidOtp(e, "hashed", 5)).toBeNull();
    });

    it("returns null when attempts have already reached the max", async () => {
      const e = email("claim-maxed");
      const row = await otpRepository.save({
        email: e,
        code: "hashed",
        expiresAt: new Date(Date.now() + 60_000),
        purpose: null,
      });
      await otpRepository
        .createQueryBuilder()
        .update()
        .set({ attempts: 5 })
        .where("uuid = :uuid", { uuid: row.uuid })
        .execute();

      expect(await otpRepository.claimValidOtp(e, "hashed", 5)).toBeNull();
    });
  });

  describe("incrementLatestPendingAttempts", () => {
    it("atomically increments attempts on the most recent eligible row", async () => {
      const e = email("incr");
      const now = Date.now();
      const oldest = await otpRepository.save({
        email: e,
        code: "h-old",
        expiresAt: new Date(now + 60_000),
        purpose: null,
      });
      const latest = await otpRepository.save({
        email: e,
        code: "h-new",
        expiresAt: new Date(now + 60_000),
        purpose: null,
      });
      await otpRepository
        .createQueryBuilder()
        .update()
        .set({ createdAt: new Date(now - 5_000) })
        .where("uuid = :uuid", { uuid: oldest.uuid })
        .execute();

      const result = await otpRepository.incrementLatestPendingAttempts(e, 5);
      expect(result).not.toBeNull();
      expect(result!.uuid).toBe(latest.uuid);
      expect(result!.attempts).toBe(1);

      const reloadedOldest = await otpRepository.findOneBy({
        uuid: oldest.uuid,
      });
      expect(reloadedOldest!.attempts).toBe(0);
    });

    it("returns null when no row exists for the email", async () => {
      expect(
        await otpRepository.incrementLatestPendingAttempts(
          email("incr-none"),
          5
        )
      ).toBeNull();
    });

    it("returns null when all rows are expired", async () => {
      const e = email("incr-expired");
      await otpRepository.save({
        email: e,
        code: "h",
        expiresAt: new Date(Date.now() - 1000),
        purpose: null,
      });
      expect(
        await otpRepository.incrementLatestPendingAttempts(e, 5)
      ).toBeNull();
    });

    it("returns null when the row is already at max attempts", async () => {
      const e = email("incr-maxed");
      const row = await otpRepository.save({
        email: e,
        code: "h",
        expiresAt: new Date(Date.now() + 60_000),
        purpose: null,
      });
      await otpRepository
        .createQueryBuilder()
        .update()
        .set({ attempts: 5 })
        .where("uuid = :uuid", { uuid: row.uuid })
        .execute();
      expect(
        await otpRepository.incrementLatestPendingAttempts(e, 5)
      ).toBeNull();
    });

    it("skips used rows even if non-expired and under max", async () => {
      const e = email("incr-used");
      const row = await otpRepository.save({
        email: e,
        code: "h",
        expiresAt: new Date(Date.now() + 60_000),
        purpose: null,
      });
      await otpRepository
        .createQueryBuilder()
        .update()
        .set({ used: true })
        .where("uuid = :uuid", { uuid: row.uuid })
        .execute();
      expect(
        await otpRepository.incrementLatestPendingAttempts(e, 5)
      ).toBeNull();
    });
  });
});
