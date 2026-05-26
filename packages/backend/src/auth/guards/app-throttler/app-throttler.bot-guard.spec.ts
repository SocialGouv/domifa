import { Controller, Get, ModuleMetadata } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import supertest from "supertest";
import { MoreThanOrEqual } from "typeorm";

import { domifaConfig } from "../../../config";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { AppThrottlerGuard } from "./app-throttler.guard";
import {
  AppLogSecurityTable,
  appLogSecurityRepository,
} from "../../../database";
import { userStatusManager } from "../../../modules/users/services";

@Controller("test-bot-guard")
class TestBotGuardController {
  @Get("ping")
  ping() {
    return { ok: true };
  }
}

@Controller("healthz")
class HealthzMockController {
  @Get("")
  root() {
    return { ok: true };
  }
}

const TEST_BOT_GUARD_NEST_MODULE: ModuleMetadata = {
  controllers: [TestBotGuardController, HealthzMockController],
  imports: [
    // Permissive limits — throttler is not what we test here.
    ThrottlerModule.forRoot([{ name: "short", ttl: 60_000, limit: 10_000 }]),
  ],
  // Expose the guard as a class provider too so tests can retrieve the
  // singleton via module.get(AppThrottlerGuard) and reset its in-memory
  // dedup state between tests.
  providers: [
    AppThrottlerGuard,
    { provide: APP_GUARD, useExisting: AppThrottlerGuard },
  ],
};

// Fictional UAs that mirror real bot patterns — used to confirm the filter
// catches unknown/custom bots, not just the well-known ones.
const FICTIONAL_BOT_UAS = [
  "Mozilla/5.0 (compatible; FakeBot/1.0; +http://example.com/bot)",
  "Mozilla/5.0 (compatible; EvilScraper/2.0)",
  "Mozilla/5.0 (compatible; CustomCrawler/3.14; +http://example.com/crawl)",
];

// Low-impact structure user from the test dump (s1-agent, structureId=1).
// We touch its status in the auto-block tests and always restore to ACTIVE.
const TEST_STRUCTURE_USER_ID = 12;
const TEST_STRUCTURE_USER_EMAIL = "s1-agent@yopmail.com";

function forgeJwt(payload: Record<string, unknown>): string {
  // extractJwtUser uses jwtDecode (no signature check), so we can forge.
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.fakesig`;
}

const REAL_BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BOT_USER_AGENTS = [
  "curl/8.4.0",
  "Wget/1.21.3",
  "python-requests/2.31.0",
  "Go-http-client/1.1",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
];

describe("AppThrottlerGuard - bot/origin filter", () => {
  let context: AppTestContext;
  let validOrigin: string;
  let testStart: Date;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(TEST_BOT_GUARD_NEST_MODULE, {
      initApp: true,
    });
    validOrigin = domifaConfig().apps.frontendUrl.replace(/\/$/, "");
    testStart = new Date();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  describe("allows legitimate requests", () => {
    it("passes with real browser UA + valid Origin (frontend)", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", validOrigin);
      expect(res.status).toBe(200);
    });

    it("passes with Origin = portail-usagers", async () => {
      const portailUsagersOrigin =
        domifaConfig().apps.portailUsagersUrl.replace(/\/$/, "");
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", portailUsagersOrigin);
      expect(res.status).toBe(200);
    });

    it("passes with Origin = portail-admins", async () => {
      const portailAdminOrigin = domifaConfig().apps.portailAdminUrl.replace(
        /\/$/,
        ""
      );
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", portailAdminOrigin);
      expect(res.status).toBe(200);
    });

    it("falls back to Referer when Origin is absent", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Referer", `${validOrigin}/some/page`);
      expect(res.status).toBe(200);
    });

    it("tolerates trailing slash in Origin", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", `${validOrigin}/`);
      expect(res.status).toBe(200);
    });
  });

  describe("blocks bot User-Agents", () => {
    it.each(BOT_USER_AGENTS)("blocks UA: %s", async (ua) => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", ua)
        .set("Origin", validOrigin);
      expect(res.status).toBe(403);
    });
  });

  describe("blocks missing User-Agent", () => {
    it("blocks empty UA string", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", "")
        .set("Origin", validOrigin);
      expect(res.status).toBe(403);
    });
  });

  describe("blocks invalid Origin", () => {
    it("blocks when neither Origin nor Referer is set", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA);
      expect(res.status).toBe(403);
    });

    it("blocks Origin not in whitelist", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", "https://evil.example.com");
      expect(res.status).toBe(403);
    });

    it("blocks Referer pointing outside the whitelist", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Referer", "https://evil.example.com/some/page");
      expect(res.status).toBe(403);
    });
  });

  describe("bypasses /healthz", () => {
    it("allows /healthz even with bot UA and no Origin", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/healthz")
        .set("User-Agent", "curl/8.4.0");
      expect(res.status).toBe(200);
    });
  });

  describe("bypasses internal probes", () => {
    it("allows the configured internal UA even with no Origin", async () => {
      const internalUa = domifaConfig().security.internalUserAgent;
      if (!internalUa) {
        // Env not configured for this test run — nothing to assert.
        return;
      }
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", internalUa);
      expect(res.status).toBe(200);
    });
  });

  describe("persists REQUEST_BLOCKED logs and auto-blocks accounts", () => {
    const recentLogsFilter = () => ({
      createdAt: MoreThanOrEqual(testStart),
    });

    beforeEach(async () => {
      // Reset in-memory dedup so each scenario starts with a clean slate.
      const guard = context.module.get(AppThrottlerGuard);
      (
        guard as unknown as { activeBlocks: Map<string, string> }
      ).activeBlocks.clear();

      // Wipe only the logs we may have produced in this run.
      await appLogSecurityRepository
        .createQueryBuilder()
        .delete()
        .from(AppLogSecurityTable)
        .where("action IN (:...actions)", {
          actions: ["REQUEST_BLOCKED", "BLOCK_USER"],
        })
        .andWhere(`"createdAt" >= :start`, { start: testStart })
        .execute();

      // Restore the test user to ACTIVE so we can re-block from a known state.
      await userStatusManager.unblockUser({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
    });

    afterAll(async () => {
      await appLogSecurityRepository
        .createQueryBuilder()
        .delete()
        .from(AppLogSecurityTable)
        .where("action IN (:...actions)", {
          actions: ["REQUEST_BLOCKED", "BLOCK_USER"],
        })
        .andWhere(`"createdAt" >= :start`, { start: testStart })
        .execute();

      await userStatusManager.unblockUser({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
    });

    it("loop of 8 curl requests = 1 REQUEST_BLOCKED row with attempts=8 (dedup)", async () => {
      for (let i = 0; i < 8; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "curl/8.5.0")
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("bot_ua");
      expect(logs[0].context.attempts).toBe(8);
      expect(logs[0].context.userAgent).toBe("curl/8.5.0");
    });

    it.each(FICTIONAL_BOT_UAS)(
      "detects fictional UA %s as bot_ua and logs it",
      async (ua) => {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", ua)
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);

        const logs = await appLogSecurityRepository.find({
          where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
        });
        expect(logs).toHaveLength(1);
        expect(logs[0].context.reason).toBe("bot_ua");
        expect(logs[0].context.userAgent).toBe(ua);
        expect(logs[0].context.attempts).toBe(1);
      }
    );

    it.each([
      "curl/8.15.0",
      "Wget/1.21.3",
      "python-requests/2.31.0",
      "Go-http-client/1.1",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    ])("logs known bot UA %s as bot_ua", async (ua) => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", ua)
        .set("Origin", validOrigin);
      expect(res.status).toBe(403);

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("bot_ua");
      expect(logs[0].context.userAgent).toBe(ua);
    });

    it("loop of 6 empty-UA requests = 1 log with missing_ua and attempts=6", async () => {
      for (let i = 0; i < 6; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "")
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("missing_ua");
      expect(logs[0].context.attempts).toBe(6);
    });

    it("loop of 7 invalid-origin requests = 1 log with invalid_origin and attempts=7", async () => {
      for (let i = 0; i < 7; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", REAL_BROWSER_UA)
          .set("Origin", "https://evil.example.com");
        expect(res.status).toBe(403);
      }

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("invalid_origin");
      expect(logs[0].context.attempts).toBe(7);
    });

    it("auto-blocks an authenticated structure user on the very first bot request; 10 attempts produce a single BLOCK_USER log", async () => {
      const jwt = forgeJwt({
        _userId: TEST_STRUCTURE_USER_ID,
        _userProfile: "structure",
        email: TEST_STRUCTURE_USER_EMAIL,
        role: "agent",
        structureId: 1,
      });

      for (let i = 0; i < 10; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "curl/8.0.0")
          .set("Authorization", `Bearer ${jwt}`)
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      // Account is BLOCKED in DB
      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
      expect(status).toBe("BLOCKED");

      // Exactly one BLOCK_USER log, with the right context
      const blockLogs = await appLogSecurityRepository.find({
        where: { action: "BLOCK_USER", ...recentLogsFilter() },
      });
      expect(blockLogs).toHaveLength(1);
      expect(blockLogs[0].context.autoBlocked).toBe(true);
      expect(blockLogs[0].context.triggeredBy).toBe("AppThrottlerGuard");
      expect(blockLogs[0].context.reason).toBe("bot_ua");
      // SUBJECT = target user — written on the row, not in context.
      expect(blockLogs[0].userId).toBe(TEST_STRUCTURE_USER_ID);
      expect(blockLogs[0].userType).toBe("user_structure");

      // REQUEST_BLOCKED dedup'd to one row with attempts=10 and per-user key
      const reqLogs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(reqLogs).toHaveLength(1);
      expect(reqLogs[0].context.attempts).toBe(10);
      expect(reqLogs[0].context.jwtUser.userId).toBe(TEST_STRUCTURE_USER_ID);
      expect(reqLogs[0].context.jwtUser.userProfile).toBe("structure");
    });

    it("never auto-blocks a usager profile even after 10 bot requests", async () => {
      const jwt = forgeJwt({
        _userId: 999,
        _userProfile: "usager",
        structureId: 1,
      });

      for (let i = 0; i < 10; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "curl/8.0.0")
          .set("Authorization", `Bearer ${jwt}`)
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      const blockLogs = await appLogSecurityRepository.find({
        where: { action: "BLOCK_USER", ...recentLogsFilter() },
      });
      expect(blockLogs).toHaveLength(0);
    });

    it("does not auto-block on invalid_origin — only bot_ua and missing_ua trigger account lock", async () => {
      const jwt = forgeJwt({
        _userId: TEST_STRUCTURE_USER_ID,
        _userProfile: "structure",
        email: TEST_STRUCTURE_USER_EMAIL,
        role: "agent",
        structureId: 1,
      });

      for (let i = 0; i < 10; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", REAL_BROWSER_UA)
          .set("Authorization", `Bearer ${jwt}`)
          .set("Origin", "https://evil.example.com");
        expect(res.status).toBe(403);
      }

      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
      expect(status).not.toBe("BLOCKED");

      const blockLogs = await appLogSecurityRepository.find({
        where: { action: "BLOCK_USER", ...recentLogsFilter() },
      });
      expect(blockLogs).toHaveLength(0);
    });
  });
});
